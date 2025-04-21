from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import json
import os
from io import StringIO
import traceback

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/api/analyze-csv', methods=['POST'])
def analyze_csv():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        if not file.filename.endswith('.csv'):
            return jsonify({'error': 'File must be a CSV'}), 400
        
        # Read the CSV file
        csv_data = file.read().decode('utf-8')
        df = pd.read_csv(StringIO(csv_data))
        
        # Basic validation
        if df.empty:
            return jsonify({'error': 'CSV file is empty'}), 400
        
        # Perform exploratory data analysis
        analysis_result = perform_eda(df)
        
        return jsonify(analysis_result), 200
    
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

def perform_eda(df):
    """
    Perform exploratory data analysis on the DataFrame
    """
    result = {
        'summary': {},
        'columns': [],
        'correlations': None,
        'insights': []
    }
    
    # Basic DataFrame info
    result['summary'] = {
        'rows': len(df),
        'columns': len(df.columns),
        'column_names': df.columns.tolist(),
        'missing_values': df.isna().sum().sum(),
        'duplicate_rows': df.duplicated().sum()
    }
    
    # Column analysis
    for column in df.columns:
        col_info = {
            'name': column,
            'dtype': str(df[column].dtype),
            'missing': int(df[column].isna().sum()),
            'unique_values': int(df[column].nunique())
        }
        
        # Numeric column statistics
        if pd.api.types.is_numeric_dtype(df[column]):
            col_info.update({
                'type': 'numeric',
                'min': float(df[column].min()) if not pd.isna(df[column].min()) else None,
                'max': float(df[column].max()) if not pd.isna(df[column].max()) else None,
                'mean': float(df[column].mean()) if not pd.isna(df[column].mean()) else None,
                'median': float(df[column].median()) if not pd.isna(df[column].median()) else None,
                'std': float(df[column].std()) if not pd.isna(df[column].std()) else None,
                'distribution': get_distribution(df[column])
            })
        # Categorical column statistics
        elif pd.api.types.is_object_dtype(df[column]) or pd.api.types.is_categorical_dtype(df[column]):
            value_counts = df[column].value_counts().head(10).to_dict()
            # Convert keys to strings to ensure JSON serialization
            value_counts = {str(k): int(v) for k, v in value_counts.items()}
            
            col_info.update({
                'type': 'categorical',
                'top_values': value_counts
            })
        # Date column statistics
        elif pd.api.types.is_datetime64_dtype(df[column]):
            col_info.update({
                'type': 'datetime',
                'min': df[column].min().strftime('%Y-%m-%d') if not pd.isna(df[column].min()) else None,
                'max': df[column].max().strftime('%Y-%m-%d') if not pd.isna(df[column].max()) else None
            })
        
        result['columns'].append(col_info)
    
    # Calculate correlations for numeric columns
    numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
    if len(numeric_cols) > 1:
        corr_matrix = df[numeric_cols].corr().round(2)
        # Convert to a format suitable for JSON
        correlations = []
        for i, col1 in enumerate(corr_matrix.columns):
            for j, col2 in enumerate(corr_matrix.columns):
                if i < j:  # Only include each pair once
                    correlations.append({
                        'column1': col1,
                        'column2': col2,
                        'correlation': float(corr_matrix.loc[col1, col2])
                    })
        
        # Sort by absolute correlation value (descending)
        correlations.sort(key=lambda x: abs(x['correlation']), reverse=True)
        result['correlations'] = correlations
    
    # Generate insights
    result['insights'] = generate_insights(df, result)
    
    return result

def get_distribution(series):
    """
    Get a simplified distribution of a numeric column
    """
    # Remove NaN values
    series = series.dropna()
    
    if len(series) == 0:
        return []
    
    # Create 10 bins
    hist, bin_edges = np.histogram(series, bins=10)
    
    # Convert to a list of {bin, count} objects
    distribution = []
    for i in range(len(hist)):
        bin_start = float(bin_edges[i])
        bin_end = float(bin_edges[i+1])
        count = int(hist[i])
        distribution.append({
            'bin_start': bin_start,
            'bin_end': bin_end,
            'count': count
        })
    
    return distribution

def generate_insights(df, analysis_result):
    """
    Generate insights based on the data analysis
    """
    insights = []
    
    # Basic dataset insights
    insights.append(f"The dataset contains {analysis_result['summary']['rows']} rows and {analysis_result['summary']['columns']} columns.")
    
    # Missing values insight
    missing_values = analysis_result['summary']['missing_values']
    if missing_values > 0:
        missing_percentage = (missing_values / (analysis_result['summary']['rows'] * analysis_result['summary']['columns'])) * 100
        insights.append(f"The dataset contains {missing_values} missing values ({missing_percentage:.2f}% of all data points).")
    else:
        insights.append("The dataset has no missing values.")
    
    # Duplicate rows insight
    duplicate_rows = analysis_result['summary']['duplicate_rows']
    if duplicate_rows > 0:
        duplicate_percentage = (duplicate_rows / analysis_result['summary']['rows']) * 100
        insights.append(f"There are {duplicate_rows} duplicate rows ({duplicate_percentage:.2f}% of the dataset).")
    
    # Column-specific insights
    for column_info in analysis_result['columns']:
        column_name = column_info['name']
        
        # Missing values in column
        if column_info['missing'] > 0:
            missing_percentage = (column_info['missing'] / analysis_result['summary']['rows']) * 100
            insights.append(f"Column '{column_name}' has {column_info['missing']} missing values ({missing_percentage:.2f}%).")
        
        # Numeric column insights
        if column_info.get('type') == 'numeric':
            # Range insight
            if 'min' in column_info and 'max' in column_info and column_info['min'] is not None and column_info['max'] is not None:
                insights.append(f"Column '{column_name}' ranges from {column_info['min']} to {column_info['max']}.")
            
            # Distribution insight
            if 'mean' in column_info and 'median' in column_info and column_info['mean'] is not None and column_info['median'] is not None:
                skew_diff = abs(column_info['mean'] - column_info['median'])
                if skew_diff > 0.1 * abs(column_info['mean']):
                    if column_info['mean'] > column_info['median']:
                        insights.append(f"Column '{column_name}' is right-skewed (mean: {column_info['mean']:.2f}, median: {column_info['median']:.2f}).")
                    else:
                        insights.append(f"Column '{column_name}' is left-skewed (mean: {column_info['mean']:.2f}, median: {column_info['median']:.2f}).")
        
        # Categorical column insights
        elif column_info.get('type') == 'categorical':
            if 'top_values' in column_info and column_info['top_values']:
                top_value = max(column_info['top_values'].items(), key=lambda x: x[1])
                top_percentage = (top_value[1] / analysis_result['summary']['rows']) * 100
                insights.append(f"The most common value in '{column_name}' is '{top_value[0]}' ({top_percentage:.2f}% of rows).")
    
    # Correlation insights
    if analysis_result['correlations'] and len(analysis_result['correlations']) > 0:
        top_correlation = analysis_result['correlations'][0]
        if abs(top_correlation['correlation']) > 0.7:
            direction = "positive" if top_correlation['correlation'] > 0 else "negative"
            insights.append(f"Strong {direction} correlation ({top_correlation['correlation']:.2f}) between '{top_correlation['column1']}' and '{top_correlation['column2']}'.")
    
    return insights

if __name__ == '__main__':
    app.run(debug=True, port=5000)

"""
Utility functions for CSV data analysis
"""
import pandas as pd
import numpy as np
from typing import Dict, List, Any, Union
from io import StringIO

def ensure_json_serializable(obj):
    """
    Recursively convert all values in a dictionary or list to JSON serializable types.

    Args:
        obj: The object to convert

    Returns:
        A JSON serializable version of the object
    """
    if isinstance(obj, dict):
        return {k: ensure_json_serializable(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [ensure_json_serializable(item) for item in obj]
    elif isinstance(obj, (np.int64, np.int32, np.int16, np.int8)):
        return int(obj)
    elif isinstance(obj, (np.float64, np.float32, np.float16)):
        return float(obj)
    elif isinstance(obj, np.bool_):
        return bool(obj)
    elif pd.isna(obj):
        return None
    elif isinstance(obj, np.ndarray):
        return ensure_json_serializable(obj.tolist())
    else:
        return obj

def analyze_csv(file_content: str) -> Dict[str, Any]:
    """
    Analyze a CSV file and return exploratory data analysis results.

    Args:
        file_content: The content of the CSV file as a string

    Returns:
        A dictionary with EDA results
    """
    try:
        # Read the CSV file
        try:
            df = pd.read_csv(StringIO(file_content))
        except pd.errors.EmptyDataError:
            raise ValueError("The CSV file is empty or contains no data")
        except pd.errors.ParserError:
            raise ValueError("Unable to parse the CSV file. Please check the file format")
        except Exception as e:
            raise ValueError(f"Error reading CSV file: {str(e)}")

        # Basic DataFrame info
        result = {
            'summary': {
                'rows': int(len(df)),
                'columns': int(len(df.columns)),
                'column_names': df.columns.tolist(),
                'missing_values': int(df.isna().sum().sum()),
                'duplicate_rows': int(df.duplicated().sum())
            },
            'columns': [],
            'correlations': None,
            'insights': []
        }

        # Column analysis
        for column in df.columns:
            col_info = {
                'name': str(column),
                'dtype': str(df[column].dtype),
                'missing': int(df[column].isna().sum()),
                'unique_values': int(df[column].nunique())
            }

            # Numeric column statistics
            if pd.api.types.is_numeric_dtype(df[column]):
                # Handle numeric columns with safe conversion to Python types
                try:
                    col_info.update({
                        'type': 'numeric',
                        'min': float(df[column].min()) if not pd.isna(df[column].min()) else None,
                        'max': float(df[column].max()) if not pd.isna(df[column].max()) else None,
                        'mean': float(df[column].mean()) if not pd.isna(df[column].mean()) else None,
                        'median': float(df[column].median()) if not pd.isna(df[column].median()) else None,
                        'std': float(df[column].std()) if not pd.isna(df[column].std()) else None,
                        'distribution': get_distribution(df[column])
                    })
                except (TypeError, ValueError) as e:
                    # If conversion fails, provide default values
                    col_info.update({
                        'type': 'numeric',
                        'min': None,
                        'max': None,
                        'mean': None,
                        'median': None,
                        'std': None,
                        'distribution': []
                    })
                    print(f"Error processing numeric column {column}: {str(e)}")
            # Categorical column statistics
            elif pd.api.types.is_object_dtype(df[column]) or pd.api.types.is_categorical_dtype(df[column]):
                try:
                    # Get value counts and handle potential serialization issues
                    value_counts = df[column].value_counts().head(10).to_dict()
                    # Convert keys and values to JSON serializable types
                    safe_value_counts = {}
                    for k, v in value_counts.items():
                        # Handle NaN keys
                        if pd.isna(k):
                            safe_key = 'NaN'
                        else:
                            # Convert any non-string keys to strings
                            safe_key = str(k)
                        # Ensure count is an integer
                        safe_value_counts[safe_key] = int(v)

                    col_info.update({
                        'type': 'categorical',
                        'top_values': safe_value_counts
                    })
                except Exception as e:
                    # Fallback for any serialization issues
                    col_info.update({
                        'type': 'categorical',
                        'top_values': {}
                    })
                    print(f"Error processing categorical column {column}: {str(e)}")
            # Date column statistics
            elif pd.api.types.is_datetime64_dtype(df[column]):
                try:
                    min_date = None
                    max_date = None
                    if not pd.isna(df[column].min()):
                        min_date = df[column].min().strftime('%Y-%m-%d')
                    if not pd.isna(df[column].max()):
                        max_date = df[column].max().strftime('%Y-%m-%d')

                    col_info.update({
                        'type': 'datetime',
                        'min': min_date,
                        'max': max_date
                    })
                except Exception as e:
                    col_info.update({
                        'type': 'datetime',
                        'min': None,
                        'max': None
                    })
                    print(f"Error processing datetime column {column}: {str(e)}")

            result['columns'].append(col_info)

        # Calculate correlations for numeric columns
        try:
            numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
            if len(numeric_cols) > 1:
                # Calculate correlation matrix
                corr_matrix = df[numeric_cols].corr().round(2)

                # Convert to a format suitable for JSON
                correlations = []
                for i, col1 in enumerate(corr_matrix.columns):
                    for j, col2 in enumerate(corr_matrix.columns):
                        if i < j:  # Only include each pair once
                            # Handle NaN correlations
                            corr_value = corr_matrix.loc[col1, col2]
                            if pd.isna(corr_value):
                                corr_value = 0.0
                            else:
                                corr_value = float(corr_value)

                            correlations.append({
                                'column1': str(col1),
                                'column2': str(col2),
                                'correlation': corr_value
                            })

                # Sort by absolute correlation value (descending)
                correlations.sort(key=lambda x: abs(x['correlation']), reverse=True)
                result['correlations'] = correlations
        except Exception as e:
            # Provide empty correlations if calculation fails
            result['correlations'] = []
            print(f"Error calculating correlations: {str(e)}")

        # Generate insights
        result['insights'] = generate_csv_insights(result)

        # Ensure the entire result is JSON serializable
        return ensure_json_serializable(result)

    except Exception as e:
        error_result = {
            'error': str(e),
            'summary': {
                'rows': 0,
                'columns': 0,
                'column_names': [],
                'missing_values': 0,
                'duplicate_rows': 0
            },
            'columns': [],
            'correlations': [],
            'insights': [f"Error analyzing CSV: {str(e)}"]
        }
        return ensure_json_serializable(error_result)

def get_distribution(series: pd.Series) -> List[Dict[str, Union[float, int]]]:
    """
    Get a simplified distribution of a numeric column

    Args:
        series: The pandas Series to analyze

    Returns:
        A list of bin information dictionaries
    """
    try:
        # Remove NaN values
        series = series.dropna()

        if len(series) == 0:
            return []

        # Create 10 bins (or fewer if there are few unique values)
        num_bins = min(10, len(series.unique()))
        if num_bins <= 1:
            return []

        # Calculate histogram
        hist, bin_edges = np.histogram(series, bins=num_bins)

        # Convert to a list of {bin, count} objects with Python native types
        distribution = []
        for i in range(len(hist)):
            try:
                bin_start = float(bin_edges[i])
                bin_end = float(bin_edges[i+1])
                count = int(hist[i])
                distribution.append({
                    'bin_start': bin_start,
                    'bin_end': bin_end,
                    'count': count
                })
            except (TypeError, ValueError, IndexError) as e:
                # Skip this bin if there's an error
                print(f"Error processing histogram bin: {str(e)}")
                continue

        return distribution
    except Exception as e:
        # Return empty distribution if calculation fails
        print(f"Error calculating distribution: {str(e)}")
        return []

def generate_csv_insights(analysis_result: Dict[str, Any]) -> List[str]:
    """
    Generate insights based on the data analysis

    Args:
        analysis_result: The analysis results dictionary

    Returns:
        A list of insight strings
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

    # Find columns with most missing values
    columns_with_missing = [(col['name'], col['missing']) for col in analysis_result['columns'] if col.get('missing', 0) > 0]
    if columns_with_missing:
        columns_with_missing.sort(key=lambda x: x[1], reverse=True)
        top_missing_cols = columns_with_missing[:3]
        for col_name, missing_count in top_missing_cols:
            missing_percentage = (missing_count / analysis_result['summary']['rows']) * 100
            insights.append(f"Column '{col_name}' has {missing_count} missing values ({missing_percentage:.2f}%).")

    # Numeric column insights
    numeric_cols = [col for col in analysis_result['columns'] if col.get('type') == 'numeric']
    if numeric_cols:
        insights.append(f"The dataset contains {len(numeric_cols)} numeric columns.")

        # Find columns with outliers
        outlier_cols = []
        for col in numeric_cols:
            if ('std' in col and col['std'] is not None and
                'mean' in col and col['mean'] is not None and
                'max' in col and col['max'] is not None and
                'min' in col and col['min'] is not None):
                if (col['max'] > col['mean'] + 3 * col['std'] or
                    col['min'] < col['mean'] - 3 * col['std']):
                    outlier_cols.append(col['name'])

        if outlier_cols:
            if len(outlier_cols) == 1:
                insights.append(f"Column '{outlier_cols[0]}' may contain outliers.")
            else:
                insights.append(f"The following columns may contain outliers: {', '.join(outlier_cols[:3])}{' and others' if len(outlier_cols) > 3 else ''}.")

        # Distribution insights for important numeric columns
        for col in numeric_cols[:3]:  # Limit to top 3 columns
            column_name = col['name']
            # Range insight
            if 'min' in col and 'max' in col and col['min'] is not None and col['max'] is not None:
                insights.append(f"Column '{column_name}' ranges from {col['min']} to {col['max']}.")

            # Distribution insight
            if 'mean' in col and 'median' in col and col['mean'] is not None and col['median'] is not None:
                skew_diff = abs(col['mean'] - col['median'])
                if skew_diff > 0.1 * abs(col['mean']):
                    if col['mean'] > col['median']:
                        insights.append(f"Column '{column_name}' is right-skewed (mean: {col['mean']:.2f}, median: {col['median']:.2f}).")
                    else:
                        insights.append(f"Column '{column_name}' is left-skewed (mean: {col['mean']:.2f}, median: {col['median']:.2f}).")

    # Categorical column insights
    categorical_cols = [col for col in analysis_result['columns'] if col.get('type') == 'categorical']
    if categorical_cols:
        insights.append(f"The dataset contains {len(categorical_cols)} categorical columns.")

        # Find columns with high cardinality
        high_cardinality = []
        for col in categorical_cols:
            if col['unique_values'] > 20 and col['unique_values'] > analysis_result['summary']['rows'] * 0.5:
                high_cardinality.append((col['name'], col['unique_values']))

        if high_cardinality:
            high_cardinality.sort(key=lambda x: x[1], reverse=True)
            if len(high_cardinality) == 1:
                insights.append(f"Column '{high_cardinality[0][0]}' has high cardinality with {high_cardinality[0][1]} unique values.")
            else:
                insights.append(f"Several columns have high cardinality, with '{high_cardinality[0][0]}' having the most unique values ({high_cardinality[0][1]}).")

        # Top values for important categorical columns
        for col in categorical_cols[:3]:  # Limit to top 3 columns
            column_name = col['name']
            if 'top_values' in col and col['top_values']:
                try:
                    top_value = max(col['top_values'].items(), key=lambda x: int(x[1]))
                    top_percentage = (int(top_value[1]) / analysis_result['summary']['rows']) * 100
                    insights.append(f"The most common value in '{column_name}' is '{top_value[0]}' ({top_percentage:.2f}% of rows).")
                except (ValueError, KeyError):
                    pass  # Skip if there's an issue with top values

    # Correlation insights
    if analysis_result.get('correlations') and len(analysis_result['correlations']) > 0:
        # Get top positive and negative correlations
        top_pos = None
        top_neg = None

        for corr in analysis_result['correlations']:
            if corr['correlation'] > 0 and (top_pos is None or corr['correlation'] > top_pos['correlation']):
                top_pos = corr
            elif corr['correlation'] < 0 and (top_neg is None or corr['correlation'] < top_neg['correlation']):
                top_neg = corr

        # Report strong correlations (|r| > 0.7)
        if top_pos and top_pos['correlation'] > 0.7:
            insights.append(f"Strong positive correlation ({top_pos['correlation']:.2f}) between '{top_pos['column1']}' and '{top_pos['column2']}'.")

        if top_neg and top_neg['correlation'] < -0.7:
            insights.append(f"Strong negative correlation ({top_neg['correlation']:.2f}) between '{top_neg['column1']}' and '{top_neg['column2']}'.")

        # If no strong correlations but some moderate ones exist
        if (not (top_pos and top_pos['correlation'] > 0.7) and
            not (top_neg and top_neg['correlation'] < -0.7)):
            if top_pos and top_pos['correlation'] > 0.5:
                insights.append(f"Moderate positive correlation ({top_pos['correlation']:.2f}) between '{top_pos['column1']}' and '{top_pos['column2']}'.")
            if top_neg and top_neg['correlation'] < -0.5:
                insights.append(f"Moderate negative correlation ({top_neg['correlation']:.2f}) between '{top_neg['column1']}' and '{top_neg['column2']}'.")

    return insights

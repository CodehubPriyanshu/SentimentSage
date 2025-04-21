import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CSVAnalysisResult,
  ColumnAnalysis,
  formatNumber,
  getCorrelationColor,
  saveCSVAnalysis,
} from "@/utils/csvAnalysis";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { Save, Download } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { exportAnalysisAsPDF } from "@/utils/pdfExport";

interface CSVAnalysisResultsProps {
  result: CSVAnalysisResult;
  aiInsights: string;
  filename?: string;
}

const CSVAnalysisResults: React.FC<CSVAnalysisResultsProps> = ({
  result,
  aiInsights,
  filename = "uploaded_csv_file.csv",
}) => {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleSaveAnalysis = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save analysis results",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      await saveCSVAnalysis(user.id, result, aiInsights, filename);

      toast({
        title: "Success",
        description: "Analysis saved to your profile",
      });
    } catch (err) {
      console.error("Error saving analysis:", err);

      toast({
        title: "Error",
        description:
          typeof err === "string"
            ? err
            : "Failed to save analysis. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle export analysis
  const handleExportAnalysis = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to export analysis results",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    try {
      // Create a properly formatted version of the analysis results for export
      const exportData = {
        // Include empty comments array since this is CSV analysis
        comments: [],
        // Include all the CSV analysis data
        columns: result.columns,
        correlations: result.correlations,
        summary: {
          rows: result.summary.rows,
          columns: result.summary.columns,
          missing_values: result.summary.missing_values,
          duplicate_rows: result.summary.duplicate_rows,
          column_names: result.summary.column_names || [],
          // Include these fields to match the expected format
          positive: 0,
          neutral: 0,
          negative: 0,
          totalComments: result.summary.rows,
          languages: {},
          toxicCount: 0,
          emotions: {
            joy: 0,
            sadness: 0,
            anger: 0,
            fear: 0,
            surprise: 0,
          },
          keywords: result.summary.column_names || [],
        },
        // Add AI insights as a separate property
        aiInsights: aiInsights,
        filename: filename,
      };

      // Try to use PDF export first, fall back to CSV if it fails
      try {
        await exportAnalysisAsPDF(exportData, "all", "all");

        toast({
          title: "Export Complete",
          description: "Your analysis has been downloaded as a PDF file",
        });
      } catch (pdfError) {
        console.error("Error exporting as PDF, falling back to CSV:", pdfError);
        // Export as CSV fallback
        exportCSVAnalysis(result, aiInsights, filename);

        toast({
          title: "Export Complete",
          description: "Your analysis has been exported as a CSV file",
        });
      }
    } catch (err) {
      console.error("Error exporting analysis:", err);

      toast({
        title: "Export Failed",
        description: "Failed to export analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Export CSV analysis as a CSV file
  const exportCSVAnalysis = (
    result: CSVAnalysisResult,
    insights: string,
    filename: string
  ) => {
    try {
      // Create CSV content
      let csvContent = "# CSV Analysis Results\n";
      csvContent += `# File: ${filename}\n`;
      csvContent += `# Date: ${new Date().toLocaleString()}\n\n`;

      // Add summary section
      csvContent += "## Dataset Summary\n";
      csvContent += `Rows,${result.summary.rows}\n`;
      csvContent += `Columns,${result.summary.columns}\n`;
      csvContent += `Missing Values,${result.summary.missing_values}\n`;
      csvContent += `Duplicate Rows,${result.summary.duplicate_rows}\n\n`;

      // Add column information
      csvContent += "## Column Analysis\n";
      csvContent +=
        "Column Name,Type,Missing Values,Unique Values,Min,Max,Mean,Median\n";

      result.columns.forEach((column) => {
        csvContent += `${column.name},${column.type},${column.missing},${column.unique_values},`;
        csvContent += `${column.min !== undefined ? column.min : "N/A"},`;
        csvContent += `${column.max !== undefined ? column.max : "N/A"},`;
        csvContent += `${column.mean !== undefined ? column.mean : "N/A"},`;
        csvContent += `${
          column.median !== undefined ? column.median : "N/A"
        }\n`;
      });

      // Add correlations if available
      if (result.correlations && result.correlations.length > 0) {
        csvContent += "\n## Correlations\n";
        csvContent += "Column 1,Column 2,Correlation\n";

        result.correlations.forEach((corr) => {
          csvContent += `${corr.column1},${
            corr.column2
          },${corr.correlation.toFixed(4)}\n`;
        });
      }

      // Add AI insights
      csvContent += "\n## AI Insights\n";
      // Replace markdown formatting with plain text
      const plainInsights = insights
        .replace(/##/g, "")
        .replace(/\n\n/g, "\n")
        .replace(/- /g, "* ");

      csvContent += plainInsights;

      // Create a blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `${filename.replace(".csv", "")}_analysis.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error creating CSV export:", error);
      throw error;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-white dark:text-white light:text-navy">
        CSV Analysis Results
      </h2>

      {/* Summary Card */}
      <Card className="bg-navy-dark dark:bg-navy-dark light:bg-white">
        <CardHeader>
          <CardTitle className="text-white dark:text-white light:text-navy">
            Dataset Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-navy-light dark:bg-navy-light light:bg-gray-100 rounded-lg">
              <div className="text-3xl font-bold text-blue">
                {result.summary.rows}
              </div>
              <div className="text-gray-400">Rows</div>
            </div>
            <div className="text-center p-4 bg-navy-light dark:bg-navy-light light:bg-gray-100 rounded-lg">
              <div className="text-3xl font-bold text-blue">
                {result.summary.columns}
              </div>
              <div className="text-gray-400">Columns</div>
            </div>
            <div className="text-center p-4 bg-navy-light dark:bg-navy-light light:bg-gray-100 rounded-lg">
              <div className="text-3xl font-bold text-blue">
                {result.summary.missing_values}
              </div>
              <div className="text-gray-400">Missing Values</div>
            </div>
            <div className="text-center p-4 bg-navy-light dark:bg-navy-light light:bg-gray-100 rounded-lg">
              <div className="text-3xl font-bold text-blue">
                {result.summary.duplicate_rows}
              </div>
              <div className="text-gray-400">Duplicate Rows</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights Card */}
      <Card className="bg-navy-dark dark:bg-navy-dark light:bg-white">
        <CardHeader>
          <CardTitle className="text-white dark:text-white light:text-navy">
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-invert max-w-none">
            {aiInsights.split("\n\n").map((paragraph, index) => {
              if (paragraph.startsWith("##")) {
                // It's a heading
                return (
                  <h3 key={index} className="text-xl font-bold text-white mt-4">
                    {paragraph.replace("##", "").trim()}
                  </h3>
                );
              } else if (paragraph.includes("\n")) {
                // It's a list
                return (
                  <ul
                    key={index}
                    className="list-disc pl-5 text-gray-300 space-y-1 mt-2"
                  >
                    {paragraph.split("\n").map((item, itemIndex) => (
                      <li key={itemIndex}>{item.replace("- ", "")}</li>
                    ))}
                  </ul>
                );
              } else {
                // Regular paragraph
                return (
                  <p key={index} className="text-gray-300 mt-2">
                    {paragraph}
                  </p>
                );
              }
            })}
          </div>

          <div className="mt-8 flex flex-col items-center gap-4">
            {/* Feature Access Banner for Unauthenticated Users */}
            {!user && (
              <div className="w-full bg-blue/10 border border-blue/20 rounded-lg p-3 mb-2 text-center">
                <p className="text-blue text-sm">
                  <a href="/login" className="underline hover:text-blue-light">
                    Sign in
                  </a>{" "}
                  or{" "}
                  <a href="/signup" className="underline hover:text-blue-light">
                    create an account
                  </a>{" "}
                  to save and export your analysis
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button
                        variant="outline"
                        className="btn-secondary"
                        onClick={handleSaveAnalysis}
                        disabled={isSaving || !user}
                      >
                        {isSaving ? (
                          <>Saving...</>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Analysis
                          </>
                        )}
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {!user && (
                    <TooltipContent>
                      <p>Please log in to save analysis</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button
                        variant="outline"
                        className="btn-secondary transition-transform hover:scale-105"
                        onClick={handleExportAnalysis}
                        disabled={isExporting || !user}
                      >
                        {isExporting ? (
                          <>Exporting...</>
                        ) : (
                          <>
                            <Download className="mr-2 h-4 w-4" />
                            Export Analysis
                          </>
                        )}
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {!user && (
                    <TooltipContent>
                      <p>Please log in to export analysis</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Column Analysis Tabs */}
      <Card className="bg-navy-dark dark:bg-navy-dark light:bg-white">
        <CardHeader>
          <CardTitle className="text-white dark:text-white light:text-navy">
            Column Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="columns" className="w-full">
            <TabsList className="w-full grid grid-cols-3 mb-6">
              <TabsTrigger value="columns">Columns</TabsTrigger>
              <TabsTrigger
                value="correlations"
                disabled={
                  !result.correlations || result.correlations.length === 0
                }
              >
                Correlations
              </TabsTrigger>
              <TabsTrigger value="distributions">Distributions</TabsTrigger>
            </TabsList>

            <TabsContent value="columns" className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-300">
                  <thead className="text-xs uppercase bg-navy-light dark:bg-navy-light light:bg-gray-100">
                    <tr>
                      <th className="px-6 py-3">Column</th>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3">Missing</th>
                      <th className="px-6 py-3">Unique</th>
                      <th className="px-6 py-3">Min</th>
                      <th className="px-6 py-3">Max</th>
                      <th className="px-6 py-3">Mean</th>
                      <th className="px-6 py-3">Median</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.columns.map((column, index) => (
                      <tr key={index} className="border-b border-gray-700">
                        <td className="px-6 py-4 font-medium text-white">
                          {column.name}
                        </td>
                        <td className="px-6 py-4">{column.type}</td>
                        <td className="px-6 py-4">{column.missing}</td>
                        <td className="px-6 py-4">{column.unique_values}</td>
                        <td className="px-6 py-4">
                          {column.min !== undefined
                            ? formatNumber(column.min as number)
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          {column.max !== undefined
                            ? formatNumber(column.max as number)
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          {column.mean !== undefined
                            ? formatNumber(column.mean)
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          {column.median !== undefined
                            ? formatNumber(column.median)
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="correlations">
              {result.correlations && result.correlations.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs uppercase bg-navy-light dark:bg-navy-light light:bg-gray-100">
                      <tr>
                        <th className="px-6 py-3">Column 1</th>
                        <th className="px-6 py-3">Column 2</th>
                        <th className="px-6 py-3">Correlation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.correlations.map((correlation, index) => (
                        <tr key={index} className="border-b border-gray-700">
                          <td className="px-6 py-4 font-medium text-white">
                            {correlation.column1}
                          </td>
                          <td className="px-6 py-4 font-medium text-white">
                            {correlation.column2}
                          </td>
                          <td
                            className={`px-6 py-4 font-medium ${getCorrelationColor(
                              correlation.correlation
                            )}`}
                          >
                            {correlation.correlation.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-400 text-center py-4">
                  No correlation data available
                </p>
              )}
            </TabsContent>

            <TabsContent value="distributions">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {result.columns
                  .filter(
                    (column) =>
                      column.type === "numeric" &&
                      column.distribution &&
                      column.distribution.length > 0
                  )
                  .map((column, index) => (
                    <div
                      key={index}
                      className="bg-navy-light dark:bg-navy-light light:bg-gray-100 p-4 rounded-lg"
                    >
                      <h4 className="text-lg font-medium text-white mb-4">
                        {column.name}
                      </h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart
                          data={column.distribution?.map((d) => ({
                            bin: `${formatNumber(d.bin_start)}-${formatNumber(
                              d.bin_end
                            )}`,
                            count: d.count,
                          }))}
                          margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                          <XAxis
                            dataKey="bin"
                            stroke="#888"
                            angle={-45}
                            textAnchor="end"
                            height={60}
                            tick={{ fontSize: 10 }}
                          />
                          <YAxis stroke="#888" />
                          <RechartsTooltip
                            contentStyle={{
                              backgroundColor: "#1e293b",
                              borderColor: "#334155",
                              color: "#fff",
                            }}
                          />
                          <Bar dataKey="count" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ))}

                {result.columns
                  .filter(
                    (column) =>
                      column.type === "categorical" && column.top_values
                  )
                  .map((column, index) => (
                    <div
                      key={index}
                      className="bg-navy-light dark:bg-navy-light light:bg-gray-100 p-4 rounded-lg"
                    >
                      <h4 className="text-lg font-medium text-white mb-4">
                        {column.name}
                      </h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart
                          data={Object.entries(column.top_values || {}).map(
                            ([key, value]) => ({
                              category: key,
                              count: value,
                            })
                          )}
                          margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                          <XAxis
                            dataKey="category"
                            stroke="#888"
                            angle={-45}
                            textAnchor="end"
                            height={60}
                            tick={{ fontSize: 10 }}
                          />
                          <YAxis stroke="#888" />
                          <RechartsTooltip
                            contentStyle={{
                              backgroundColor: "#1e293b",
                              borderColor: "#334155",
                              color: "#fff",
                            }}
                          />
                          <Bar dataKey="count" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CSVAnalysisResults;

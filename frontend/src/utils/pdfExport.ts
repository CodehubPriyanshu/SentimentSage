import { toast } from "@/components/ui/use-toast";

// Define the comment interface
interface Comment {
  id: string;
  text: string;
  sentiment: "positive" | "neutral" | "negative";
  language: string;
  toxicity?: number;
  emotions?: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
  };
  keywords?: string[];
}

// Define the analysis results interface
interface AnalysisResults {
  comments: Comment[];
  summary: {
    positive: number;
    neutral: number;
    negative: number;
    totalComments: number;
    languages: Record<string, number>;
    toxicCount: number;
    emotions: {
      joy: number;
      sadness: number;
      anger: number;
      fear: number;
      surprise: number;
    };
    keywords: string[];
  };
}

// Function to get language display name
const getLanguageDisplayName = (code: string): string => {
  const languageNames: Record<string, string> = {
    en: "English",
    es: "Spanish",
    fr: "French",
    de: "German",
    ru: "Russian",
    hi: "Hindi",
    zh: "Chinese",
    ja: "Japanese",
    ar: "Arabic",
    pt: "Portuguese",
    it: "Italian",
    nl: "Dutch",
    ko: "Korean",
    tr: "Turkish",
    pl: "Polish",
    sv: "Swedish",
  };

  return languageNames[code] || code;
};

// Fallback function to export analysis as CSV
const exportAsCSV = (
  results: AnalysisResults,
  filter: "all" | "positive" | "neutral" | "negative" = "all",
  languageFilter: string = "all"
): void => {
  // Show loading toast
  toast({
    title: "Generating CSV",
    description: "Preparing your analysis data as CSV...",
  });

  // Filter comments based on current filters
  let filteredComments = results.comments;

  // Apply sentiment filter
  if (filter !== "all") {
    filteredComments = filteredComments.filter(
      (comment) => comment.sentiment === filter
    );
  }

  // Apply language filter
  if (languageFilter !== "all") {
    filteredComments = filteredComments.filter(
      (comment) => comment.language === languageFilter
    );
  }

  // Create CSV header
  let csv = "Comment,Sentiment,Language,Sensitive\n";

  // Add comment data
  filteredComments.forEach((comment) => {
    // Escape commas and quotes in the comment text
    const escapedText = comment.text.replace(/"/g, '""').replace(/\n/g, " ");
    const sentiment =
      comment.sentiment.charAt(0).toUpperCase() + comment.sentiment.slice(1);
    const language = getLanguageDisplayName(comment.language);
    const sensitive = comment.toxicity && comment.toxicity > 0.7 ? "Yes" : "No";

    csv += `"${escapedText}","${sentiment}","${language}","${sensitive}"\n`;
  });

  // Add summary data
  csv += "\n\nSummary:\n";
  csv += `Positive,${results.summary.positive}%\n`;
  csv += `Neutral,${results.summary.neutral}%\n`;
  csv += `Negative,${results.summary.negative}%\n`;

  // Create a blob and download link
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "SentimentSage_Analysis.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Show success toast
  toast({
    title: "CSV Generated",
    description: "Your analysis data has been downloaded as a CSV file.",
  });
};

// Function to export analysis results as PDF
export const exportAnalysisAsPDF = async (
  results: AnalysisResults | any,
  filter: "all" | "positive" | "neutral" | "negative" = "all",
  languageFilter: string = "all"
): Promise<void> => {
  try {
    // Show loading toast
    toast({
      title: "Generating PDF",
      description: "Please wait while we prepare your analysis report...",
    });

    // Try to dynamically import jspdf and jspdf-autotable
    try {
      // Dynamically import jspdf and jspdf-autotable
      const jsPDFModule = await import("jspdf");
      const jsPDF = jsPDFModule.default;
      const autoTableModule = await import("jspdf-autotable");
      const autoTable = autoTableModule.default;

      // Create a new PDF document
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Add title
      doc.setFontSize(20);
      doc.setTextColor(0, 0, 128); // Dark blue

      // Check if this is a CSV analysis or comment analysis
      const isCSVAnalysis = !results.comments || results.comments.length === 0;
      const title = isCSVAnalysis
        ? "SentimentSage CSV Analysis Report"
        : "SentimentSage Comment Analysis Report";
      doc.text(title, 105, 15, { align: "center" });

      // Add filename if available (for CSV analysis)
      if (isCSVAnalysis && results.filename) {
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 128); // Dark blue
        doc.text(`File: ${results.filename}`, 105, 25, { align: "center" });
      }

      // Add date
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100); // Gray
      const date = new Date().toLocaleString();
      doc.text(`Generated on: ${date}`, 105, 22, { align: "center" });

      // Add summary section
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0); // Black

      // Variables for drawing
      const barWidth = 120;
      const barHeight = 8;
      const startX = 14;
      let startY = 50;

      if (isCSVAnalysis) {
        // For CSV analysis
        doc.text("Dataset Summary", 14, 35);

        // Add dataset information
        doc.setFontSize(12);
        if (results.summary.rows) {
          doc.text(`Rows: ${results.summary.rows}`, 14, 45);
        }
        if (results.summary.columns) {
          doc.text(`Columns: ${results.summary.columns}`, 14, 52);
        }
        if (results.summary.missing_values !== undefined) {
          doc.text(`Missing Values: ${results.summary.missing_values}`, 14, 59);
        }
        if (results.summary.duplicate_rows !== undefined) {
          doc.text(`Duplicate Rows: ${results.summary.duplicate_rows}`, 14, 66);
        }

        // Add column information if available
        if (results.columns && results.columns.length > 0) {
          doc.setFontSize(14);
          doc.text("Column Analysis", 14, 80);

          // Create table data for columns
          const columnHeaders = [
            [
              "Column",
              "Type",
              "Missing",
              "Unique",
              "Min",
              "Max",
              "Mean",
              "Median",
            ],
          ];
          const columnData = results.columns.map((column) => [
            column.name,
            column.type,
            column.missing.toString(),
            column.unique_values.toString(),
            column.min !== undefined ? column.min.toString() : "N/A",
            column.max !== undefined ? column.max.toString() : "N/A",
            column.mean !== undefined ? column.mean.toString() : "N/A",
            column.median !== undefined ? column.median.toString() : "N/A",
          ]);

          // Add column table
          autoTable(doc, {
            startY: 85,
            head: columnHeaders,
            body: columnData,
            theme: "striped",
            headStyles: {
              fillColor: [0, 0, 128], // Dark blue
              textColor: 255,
              fontStyle: "bold",
            },
            styles: {
              fontSize: 8,
              cellPadding: 2,
            },
          });

          // Add correlations if available
          if (results.correlations && results.correlations.length > 0) {
            // Get the Y position after the column table
            const finalY = (doc as any).lastAutoTable.finalY + 15;

            doc.setFontSize(14);
            doc.text("Correlations", 14, finalY);

            // Create table data for correlations
            const corrHeaders = [["Column 1", "Column 2", "Correlation"]];
            const corrData = results.correlations.map((corr) => [
              corr.column1,
              corr.column2,
              corr.correlation.toFixed(4),
            ]);

            // Add correlation table
            autoTable(doc, {
              startY: finalY + 5,
              head: corrHeaders,
              body: corrData,
              theme: "striped",
              headStyles: {
                fillColor: [0, 0, 128], // Dark blue
                textColor: 255,
                fontStyle: "bold",
              },
              styles: {
                fontSize: 8,
                cellPadding: 2,
              },
            });
          }

          // Add AI Insights if available
          if (results.aiInsights) {
            // Get the Y position after the previous content
            let insightsY = (doc as any).lastAutoTable
              ? (doc as any).lastAutoTable.finalY + 15
              : 200;

            // Check if we need a new page
            if (insightsY > doc.internal.pageSize.height - 40) {
              doc.addPage();
              insightsY = 20;
            }

            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0); // Black
            doc.text("AI Insights", 14, insightsY);

            // Format the insights text
            const insights = results.aiInsights.split("\n\n");
            let currentY = insightsY + 10;

            insights.forEach((paragraph) => {
              if (paragraph.startsWith("##")) {
                // It's a heading
                doc.setFontSize(12);
                doc.setTextColor(0, 0, 128); // Dark blue
                doc.text(paragraph.replace("##", "").trim(), 14, currentY);
                currentY += 8;
              } else if (paragraph.includes("\n")) {
                // It's a list
                doc.setFontSize(10);
                doc.setTextColor(0, 0, 0); // Black

                paragraph.split("\n").forEach((item) => {
                  // Check if we need a new page
                  if (currentY > doc.internal.pageSize.height - 20) {
                    doc.addPage();
                    currentY = 20;
                  }

                  const listItem = item.replace("- ", "").trim();
                  const formattedItem = doc.splitTextToSize(
                    "• " + listItem,
                    180
                  );
                  doc.text(formattedItem, 20, currentY);
                  currentY += formattedItem.length * 6;
                });
              } else {
                // Regular paragraph
                doc.setFontSize(10);
                doc.setTextColor(0, 0, 0); // Black

                // Check if we need a new page
                if (currentY > doc.internal.pageSize.height - 20) {
                  doc.addPage();
                  currentY = 20;
                }

                const formattedParagraph = doc.splitTextToSize(paragraph, 180);
                doc.text(formattedParagraph, 14, currentY);
                currentY += formattedParagraph.length * 6;
              }
            });
          }
        }
      } else {
        // For comment analysis
        doc.text("Sentiment Summary", 14, 35);

        // Add sentiment distribution (only for comment analysis)
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0); // Black
        doc.text("Sentiment Distribution:", 14, 45);

        // Positive sentiment bar
        doc.setFillColor(76, 175, 80); // Green
        doc.rect(
          startX,
          startY,
          (barWidth * results.summary.positive) / 100,
          barHeight,
          "F"
        );
        doc.setFontSize(10);
        doc.text(
          `Positive: ${results.summary.positive}%`,
          startX + barWidth + 5,
          startY + 5
        );

        // Neutral sentiment bar
        startY += 12;
        doc.setFillColor(100, 181, 246); // Blue
        doc.rect(
          startX,
          startY,
          (barWidth * results.summary.neutral) / 100,
          barHeight,
          "F"
        );
        doc.text(
          `Neutral: ${results.summary.neutral}%`,
          startX + barWidth + 5,
          startY + 5
        );

        // Negative sentiment bar
        startY += 12;
        doc.setFillColor(244, 67, 54); // Red
        doc.rect(
          startX,
          startY,
          (barWidth * results.summary.negative) / 100,
          barHeight,
          "F"
        );
        doc.text(
          `Negative: ${results.summary.negative}%`,
          startX + barWidth + 5,
          startY + 5
        );

        // Add language distribution
        startY += 20;
        doc.setFontSize(12);
        doc.text("Detected Languages:", 14, startY);

        startY += 8;
        const languages = Object.entries(results.summary.languages || {});
        languages.forEach(([code, count], index) => {
          const languageName = getLanguageDisplayName(code);
          doc.setFontSize(10);
          doc.text(
            `${languageName}: ${count} comments`,
            20,
            startY + index * 6
          );
        });

        // Add emotions section
        startY += Math.max(languages.length * 6, 20);
        doc.setFontSize(12);
        doc.text("Emotional Analysis:", 14, startY);

        startY += 8;
        const emotions = [
          {
            name: "Joy",
            value: results.summary.emotions.joy,
            color: [76, 175, 80],
          }, // Green
          {
            name: "Sadness",
            value: results.summary.emotions.sadness,
            color: [33, 150, 243],
          }, // Blue
          {
            name: "Anger",
            value: results.summary.emotions.anger,
            color: [244, 67, 54],
          }, // Red
          {
            name: "Fear",
            value: results.summary.emotions.fear,
            color: [156, 39, 176],
          }, // Purple
          {
            name: "Surprise",
            value: results.summary.emotions.surprise,
            color: [255, 152, 0],
          }, // Orange
        ];

        emotions.forEach((emotion, index) => {
          doc.setFontSize(10);
          doc.text(`${emotion.name}:`, 20, startY + index * 8);

          // Draw emotion bar
          doc.setFillColor(
            emotion.color[0],
            emotion.color[1],
            emotion.color[2]
          );
          doc.rect(
            50,
            startY + index * 8 - 4,
            (barWidth * emotion.value) / 100,
            5,
            "F"
          );
          doc.text(
            `${emotion.value}%`,
            50 + (barWidth * emotion.value) / 100 + 5,
            startY + index * 8
          );
        });

        // Add keywords section
        startY += 50;
        doc.setFontSize(12);
        doc.text("Common Themes:", 14, startY);

        startY += 8;
        const keywords = (results.summary.keywords || []).slice(0, 10);
        let keywordText = "";
        keywords.forEach((keyword, index) => {
          keywordText += keyword;
          if (index < keywords.length - 1) {
            keywordText += ", ";
          }
        });

        doc.setFontSize(10);
        const splitKeywords = doc.splitTextToSize(
          keywordText || "No keywords available",
          180
        );
        doc.text(splitKeywords, 14, startY);

        // Only add comments section for comment analysis
        if (results.comments && results.comments.length > 0) {
          // Filter comments based on current filters
          let filteredComments = results.comments;

          // Apply sentiment filter
          if (filter !== "all") {
            filteredComments = filteredComments.filter(
              (comment) => comment.sentiment === filter
            );
          }

          // Apply language filter
          if (languageFilter !== "all") {
            filteredComments = filteredComments.filter(
              (comment) => comment.language === languageFilter
            );
          }

          // Add comments table
          startY += splitKeywords.length * 6 + 10;
          doc.setFontSize(14);
          doc.text("Individual Comments", 14, startY);

          // Prepare table data for the summary table
          const tableData = filteredComments.map((comment) => [
            comment.text.length > 60
              ? comment.text.substring(0, 57) + "..."
              : comment.text,
            comment.sentiment.charAt(0).toUpperCase() +
              comment.sentiment.slice(1),
            getLanguageDisplayName(comment.language),
            comment.toxicity && comment.toxicity > 0.7 ? "Yes" : "No",
          ]);

          // Add table
          autoTable(doc, {
            startY: startY + 5,
            head: [["Comment", "Sentiment", "Language", "Sensitive"]],
            body: tableData,
            theme: "striped",
            headStyles: {
              fillColor: [0, 0, 128], // Dark blue
              textColor: 255,
              fontStyle: "bold",
            },
            styles: {
              fontSize: 8,
              cellPadding: 2,
            },
            columnStyles: {
              0: { cellWidth: 100 },
              1: { cellWidth: 30 },
              2: { cellWidth: 30 },
              3: { cellWidth: 20 },
            },
          });

          // Add detailed analysis section for each comment
          const finalY = (doc as any).lastAutoTable.finalY + 15;
          doc.addPage();
          let detailY = 20;

          doc.setFontSize(16);
          doc.setTextColor(0, 0, 128); // Dark blue
          doc.text("Detailed Comment Analysis", 14, detailY);
          detailY += 15;

          // Loop through each comment to add detailed analysis
          filteredComments.forEach((comment, index) => {
            // Check if we need a new page
            if (detailY > doc.internal.pageSize.height - 40) {
              doc.addPage();
              detailY = 20;
            }

            // Comment number and text
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 128); // Dark blue
            doc.text(`Comment #${index + 1}`, 14, detailY);
            detailY += 8;

            // Comment text
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0); // Black
            const commentLines = doc.splitTextToSize(comment.text, 180);
            doc.text(commentLines, 14, detailY);
            detailY += commentLines.length * 6 + 5;

            // Sentiment analysis
            doc.setFontSize(11);
            doc.setTextColor(0, 0, 128); // Dark blue
            doc.text("Sentiment Analysis:", 14, detailY);
            detailY += 6;

            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0); // Black

            // Set sentiment color
            let sentimentColor;
            switch (comment.sentiment) {
              case "positive":
                sentimentColor = [76, 175, 80]; // Green
                break;
              case "negative":
                sentimentColor = [244, 67, 54]; // Red
                break;
              default:
                sentimentColor = [100, 181, 246]; // Blue
            }

            doc.setFillColor(
              sentimentColor[0],
              sentimentColor[1],
              sentimentColor[2]
            );
            doc.roundedRect(14, detailY, 10, 10, 1, 1, "F");
            doc.text(
              `${
                comment.sentiment.charAt(0).toUpperCase() +
                comment.sentiment.slice(1)
              }`,
              30,
              detailY + 7
            );
            detailY += 15;

            // Language detection
            doc.setFontSize(11);
            doc.setTextColor(0, 0, 128); // Dark blue
            doc.text("Language:", 14, detailY);
            detailY += 6;

            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0); // Black
            doc.text(
              `${getLanguageDisplayName(comment.language)}`,
              14,
              detailY
            );
            detailY += 10;

            // Emotional analysis if available
            if (comment.emotions) {
              doc.setFontSize(11);
              doc.setTextColor(0, 0, 128); // Dark blue
              doc.text("Emotional Analysis:", 14, detailY);
              detailY += 10;

              // Draw emotion bars
              const emotions = [
                {
                  name: "Joy",
                  value: comment.emotions.joy,
                  color: [76, 175, 80],
                },
                {
                  name: "Sadness",
                  value: comment.emotions.sadness,
                  color: [33, 150, 243],
                },
                {
                  name: "Anger",
                  value: comment.emotions.anger,
                  color: [244, 67, 54],
                },
                {
                  name: "Fear",
                  value: comment.emotions.fear,
                  color: [156, 39, 176],
                },
                {
                  name: "Surprise",
                  value: comment.emotions.surprise,
                  color: [255, 152, 0],
                },
              ];

              emotions.forEach((emotion, idx) => {
                doc.setFontSize(9);
                doc.text(`${emotion.name}:`, 20, detailY + idx * 8);

                // Draw emotion bar
                doc.setFillColor(
                  emotion.color[0],
                  emotion.color[1],
                  emotion.color[2]
                );
                doc.rect(
                  50,
                  detailY + idx * 8 - 4,
                  (80 * emotion.value) / 100,
                  5,
                  "F"
                );
                doc.text(
                  `${emotion.value}%`,
                  50 + (80 * emotion.value) / 100 + 5,
                  detailY + idx * 8
                );
              });

              detailY += emotions.length * 8 + 5;
            }

            // Keywords if available
            if (comment.keywords && comment.keywords.length > 0) {
              doc.setFontSize(11);
              doc.setTextColor(0, 0, 128); // Dark blue
              doc.text("Keywords:", 14, detailY);
              detailY += 6;

              doc.setFontSize(10);
              doc.setTextColor(0, 0, 0); // Black
              const keywordsText = comment.keywords.join(", ");
              const keywordLines = doc.splitTextToSize(keywordsText, 180);
              doc.text(keywordLines, 14, detailY);
              detailY += keywordLines.length * 6 + 5;
            }

            // Toxicity if available
            if (comment.toxicity !== undefined) {
              doc.setFontSize(11);
              doc.setTextColor(0, 0, 128); // Dark blue
              doc.text("Content Sensitivity:", 14, detailY);
              detailY += 6;

              doc.setFontSize(10);
              doc.setTextColor(0, 0, 0); // Black

              const toxicityLevel =
                comment.toxicity > 0.7
                  ? "High"
                  : comment.toxicity > 0.4
                  ? "Medium"
                  : "Low";
              const toxicityColor =
                comment.toxicity > 0.7
                  ? [244, 67, 54] // Red
                  : comment.toxicity > 0.4
                  ? [255, 152, 0] // Orange
                  : [76, 175, 80]; // Green

              doc.setFillColor(
                toxicityColor[0],
                toxicityColor[1],
                toxicityColor[2]
              );
              doc.roundedRect(14, detailY, 10, 10, 1, 1, "F");
              doc.text(
                `${toxicityLevel} (${Math.round(comment.toxicity * 100)}%)`,
                30,
                detailY + 7
              );
              detailY += 20;
            }

            // Add separator line between comments
            if (index < filteredComments.length - 1) {
              doc.setDrawColor(200, 200, 200); // Light gray
              doc.line(14, detailY - 10, 190, detailY - 10);
              detailY += 5;
            }
          });
        }
      }

      // Add footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100); // Gray
        doc.text(
          "Generated by SentimentSage - AI-Powered Comment Analysis",
          105,
          doc.internal.pageSize.height - 10,
          { align: "center" }
        );
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.width - 20,
          doc.internal.pageSize.height - 10
        );
      }

      // Save the PDF
      doc.save("SentimentSage_Analysis.pdf");

      // Show success toast
      toast({
        title: "PDF Generated",
        description: "Your analysis report has been downloaded successfully.",
      });
    } catch (importError) {
      console.error("Error importing PDF libraries:", importError);

      // Create a fallback CSV export since PDF libraries aren't available
      exportAsCSV(results, filter, languageFilter);
      return;
    }
  } catch (error) {
    console.error("Error generating PDF:", error);

    // Show error toast
    toast({
      title: "Error Generating PDF",
      description:
        "There was an error generating your PDF. Falling back to CSV export.",
      variant: "destructive",
    });

    // Try CSV export as fallback
    try {
      exportAsCSV(results, filter, languageFilter);
    } catch (csvError) {
      console.error("Error generating CSV:", csvError);
      toast({
        title: "Export Failed",
        description:
          "Unable to export analysis results. Please try again later.",
        variant: "destructive",
      });
    }
  }
};

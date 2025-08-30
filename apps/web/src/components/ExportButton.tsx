"use client";

import * as React from "react";
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  File,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type ExportFormat = "csv" | "json" | "xlsx" | "txt" | "pdf";

export interface ExportOption {
  format: ExportFormat;
  label: string;
  icon?: React.ReactNode;
  description?: string;
  disabled?: boolean;
}

export interface ExportButtonProps {
  // Data to export
  data: any[];
  
  // Export options
  formats?: ExportFormat[];
  customOptions?: ExportOption[];
  
  // File naming
  filename?: string;
  generateFilename?: (format: ExportFormat, timestamp: Date) => string;
  
  // Data processing
  onExport?: (data: any[], format: ExportFormat) => void | Promise<void>;
  processData?: (data: any[], format: ExportFormat) => any[];
  
  // Filtering
  includeFilters?: boolean;
  filterState?: Record<string, any>;
  
  // UI customization
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
  showCount?: boolean;
  
  // States
  loading?: boolean;
  disabled?: boolean;
  
  // Styling
  className?: string;
}

const formatIcons: Record<ExportFormat, React.ReactNode> = {
  csv: <FileSpreadsheet className="h-4 w-4" />,
  json: <File className="h-4 w-4" />,
  xlsx: <FileSpreadsheet className="h-4 w-4" />,
  txt: <FileText className="h-4 w-4" />,
  pdf: <FileText className="h-4 w-4" />,
};

const defaultFormats: ExportFormat[] = ["csv", "json", "xlsx"];

export function ExportButton({
  data,
  formats = defaultFormats,
  customOptions = [],
  filename,
  generateFilename,
  onExport,
  processData,
  includeFilters = true,
  filterState = {},
  variant = "outline",
  size = "sm",
  showCount = true,
  loading = false,
  disabled = false,
  className,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = React.useState<ExportFormat | null>(null);
  const [exportStatus, setExportStatus] = React.useState<{
    format: ExportFormat;
    status: "success" | "error";
    message?: string;
  } | null>(null);

  // Generate default filename
  const getFilename = (format: ExportFormat) => {
    if (generateFilename) {
      return generateFilename(format, new Date());
    }
    
    if (filename) {
      return `${filename}.${format}`;
    }
    
    const timestamp = new Date().toISOString().split("T")[0];
    return `export_${timestamp}.${format}`;
  };

  // Process data for export
  const processExportData = (format: ExportFormat) => {
    let exportData = [...data];
    
    if (processData) {
      exportData = processData(exportData, format);
    }
    
    // Add filter metadata if requested
    if (includeFilters && Object.keys(filterState).length > 0) {
      const metadata = {
        exportedAt: new Date().toISOString(),
        totalRecords: data.length,
        filters: filterState,
        ...exportData[0] ? { sampleRecord: "See data below" } : {},
      };
      
      if (format === "json") {
        return {
          metadata,
          data: exportData,
        };
      } else {
        // For CSV/XLSX, add metadata as first rows
        const metadataRows = [
          { __metadata: `Exported: ${metadata.exportedAt}` },
          { __metadata: `Total Records: ${metadata.totalRecords}` },
          { __metadata: `Applied Filters: ${JSON.stringify(metadata.filters)}` },
          { __metadata: "--- Data Start ---" },
        ];
        return [...metadataRows, ...exportData];
      }
    }
    
    return exportData;
  };

  // Convert data to CSV
  const convertToCSV = (exportData: any[]) => {
    if (exportData.length === 0) return "";
    
    const headers = Object.keys(exportData[0]).join(",");
    const rows = exportData.map(row =>
      Object.values(row)
        .map(value => {
          const stringValue = String(value || "");
          // Escape commas and quotes
          if (stringValue.includes(",") || stringValue.includes('"')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        })
        .join(",")
    );
    
    return [headers, ...rows].join("\n");
  };

  // Convert data to text
  const convertToText = (exportData: any[]) => {
    if (exportData.length === 0) return "";
    
    return exportData
      .map(row => 
        Object.entries(row)
          .map(([key, value]) => `${key}: ${value}`)
          .join(" | ")
      )
      .join("\n");
  };

  // Download file
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle export
  const handleExport = async (format: ExportFormat) => {
    if (disabled || isExporting || data.length === 0) return;

    setIsExporting(format);
    setExportStatus(null);

    try {
      const exportData = processExportData(format);
      const filename = getFilename(format);

      // Custom export handler
      if (onExport) {
        await onExport(exportData, format);
      } else {
        // Default export handling
        switch (format) {
          case "csv":
            const csvContent = convertToCSV(Array.isArray(exportData) ? exportData : exportData.data || []);
            downloadFile(csvContent, filename, "text/csv");
            break;
            
          case "json":
            const jsonContent = JSON.stringify(exportData, null, 2);
            downloadFile(jsonContent, filename, "application/json");
            break;
            
          case "txt":
            const textContent = convertToText(Array.isArray(exportData) ? exportData : exportData.data || []);
            downloadFile(textContent, filename, "text/plain");
            break;
            
          case "xlsx":
            // For XLSX, we'd typically use a library like xlsx
            // For now, fall back to CSV
            const xlsxContent = convertToCSV(Array.isArray(exportData) ? exportData : exportData.data || []);
            downloadFile(xlsxContent, filename.replace(".xlsx", ".csv"), "text/csv");
            break;
            
          case "pdf":
            // PDF export would typically require a library like jsPDF
            // For now, fall back to text
            const pdfContent = convertToText(Array.isArray(exportData) ? exportData : exportData.data || []);
            downloadFile(pdfContent, filename.replace(".pdf", ".txt"), "text/plain");
            break;
        }
      }

      setExportStatus({ format, status: "success" });
    } catch (error) {
      console.error("Export failed:", error);
      setExportStatus({ 
        format, 
        status: "error", 
        message: error instanceof Error ? error.message : "Export failed" 
      });
    } finally {
      setIsExporting(null);
    }
  };

  // Clear status after delay
  React.useEffect(() => {
    if (exportStatus) {
      const timer = setTimeout(() => setExportStatus(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [exportStatus]);

  // Generate export options
  const exportOptions: ExportOption[] = [
    ...formats.map(format => ({
      format,
      label: format.toUpperCase(),
      icon: formatIcons[format],
      description: `Export as ${format.toUpperCase()} file`,
    })),
    ...customOptions,
  ];

  if (data.length === 0) {
    return null;
  }

  const buttonContent = (
    <>
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : exportStatus?.status === "success" ? (
        <CheckCircle className="h-4 w-4 text-green-600" />
      ) : exportStatus?.status === "error" ? (
        <AlertCircle className="h-4 w-4 text-red-600" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      
      <span>
        Export
        {showCount && ` (${data.length})`}
      </span>
    </>
  );

  // Single format - render as direct button
  if (exportOptions.length === 1) {
    return (
      <Button
        variant={variant}
        size={size}
        onClick={() => handleExport(exportOptions[0].format)}
        disabled={disabled || loading || !!isExporting}
        className={cn("flex items-center gap-2", className)}
      >
        {buttonContent}
      </Button>
    );
  }

  // Multiple formats - render as dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={disabled || loading || !!isExporting}
          className={cn("flex items-center gap-2", className)}
        >
          {buttonContent}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Export Options</span>
          {showCount && (
            <Badge variant="secondary" className="text-xs">
              {data.length} items
            </Badge>
          )}
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {exportOptions.map((option) => (
          <DropdownMenuItem
            key={option.format}
            onClick={() => handleExport(option.format)}
            disabled={option.disabled || !!isExporting}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className="flex items-center gap-2 flex-1">
              {option.icon}
              <span>{option.label}</span>
            </span>
            
            {isExporting === option.format && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            
            {exportStatus?.format === option.format && exportStatus.status === "success" && (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
            
            {exportStatus?.format === option.format && exportStatus.status === "error" && (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
          </DropdownMenuItem>
        ))}
        
        {includeFilters && Object.keys(filterState).length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-1">
              <p className="text-xs text-muted-foreground">
                Active filters will be included
              </p>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Quick export functions
export const exportToCSV = (data: any[], filename?: string) => {
  const csvContent = data.length > 0 
    ? [
        Object.keys(data[0]).join(","),
        ...data.map(row =>
          Object.values(row)
            .map(value => String(value || ""))
            .join(",")
        )
      ].join("\n")
    : "";

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  link.href = url;
  link.download = filename || `export_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToJSON = (data: any[], filename?: string) => {
  const jsonContent = JSON.stringify(data, null, 2);
  
  const blob = new Blob([jsonContent], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  link.href = url;
  link.download = filename || `export_${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
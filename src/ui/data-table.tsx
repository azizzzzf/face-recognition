"use client";

import * as React from "react";
import { 
  ChevronDown, 
  ChevronUp, 
  ChevronsUpDown, 
  Search
} from "lucide-react";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  key: keyof T | string;
  header: string;
  cell?: (value: unknown, row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  searchable?: boolean;
  className?: string;
  headerClassName?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  sortable?: boolean;
  pagination?: {
    enabled: boolean;
    pageSize?: number;
    showPageSizeSelector?: boolean;
    pageSizeOptions?: number[];
  };
  loading?: boolean;
  emptyState?: React.ReactNode;
  className?: string;
  tableClassName?: string;
  onRowClick?: (row: T, index: number) => void;
  rowClassName?: (row: T, index: number) => string;
}

type SortDirection = "asc" | "desc" | null;

interface SortState {
  column: string | null;
  direction: SortDirection;
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  searchable = true,
  searchPlaceholder = "Search...",
  searchKeys,
  sortable = true,
  pagination = { enabled: true, pageSize: 10 },
  loading = false,
  emptyState,
  className,
  tableClassName,
  onRowClick,
  rowClassName,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortState, setSortState] = React.useState<SortState>({
    column: null,
    direction: null,
  });
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(pagination.pageSize || 10);

  // Filter data based on search query
  const filteredData = React.useMemo(() => {
    if (!searchQuery.trim()) return data;

    const query = searchQuery.toLowerCase();
    const keysToSearch = searchKeys || 
      columns
        .filter(col => col.searchable !== false)
        .map(col => col.key as keyof T);

    return data.filter(row => 
      keysToSearch.some(key => {
        const value = row[key];
        return value && 
          String(value).toLowerCase().includes(query);
      })
    );
  }, [data, searchQuery, searchKeys, columns]);

  // Sort filtered data
  const sortedData = React.useMemo(() => {
    if (!sortState.column || !sortState.direction) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortState.column!];
      const bVal = b[sortState.column!];

      // Handle null/undefined values
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return sortState.direction === "asc" ? -1 : 1;
      if (bVal == null) return sortState.direction === "asc" ? 1 : -1;

      // Handle different data types
      if (typeof aVal === "string" && typeof bVal === "string") {
        const comparison = aVal.localeCompare(bVal);
        return sortState.direction === "asc" ? comparison : -comparison;
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortState.direction === "asc" ? aVal - bVal : bVal - aVal;
      }

      // Date comparison
      if (aVal instanceof Date && bVal instanceof Date) {
        return sortState.direction === "asc" 
          ? aVal.getTime() - bVal.getTime()
          : bVal.getTime() - aVal.getTime();
      }

      // String comparison as fallback
      const aStr = String(aVal);
      const bStr = String(bVal);
      const comparison = aStr.localeCompare(bStr);
      return sortState.direction === "asc" ? comparison : -comparison;
    });
  }, [filteredData, sortState]);

  // Paginate sorted data
  const paginatedData = React.useMemo(() => {
    if (!pagination.enabled) return sortedData;

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, pageSize, pagination.enabled]);

  // Calculate pagination info
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, sortedData.length);

  // Handle sorting
  const handleSort = (columnKey: string) => {
    if (!sortable) return;
    
    const column = columns.find(col => col.key === columnKey);
    if (!column || column.sortable === false) return;

    setSortState(prev => {
      if (prev.column !== columnKey) {
        return { column: columnKey, direction: "asc" };
      }
      
      if (prev.direction === "asc") {
        return { column: columnKey, direction: "desc" };
      }
      
      if (prev.direction === "desc") {
        return { column: null, direction: null };
      }
      
      return { column: columnKey, direction: "asc" };
    });
  };

  // Get sort icon
  const getSortIcon = (columnKey: string) => {
    const column = columns.find(col => col.key === columnKey);
    if (!sortable || column?.sortable === false) return null;

    if (sortState.column !== columnKey) {
      return <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />;
    }

    if (sortState.direction === "asc") {
      return <ChevronUp className="ml-2 h-4 w-4" />;
    }

    if (sortState.direction === "desc") {
      return <ChevronDown className="ml-2 h-4 w-4" />;
    }

    return <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />;
  };

  // Reset pagination when search or sort changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortState]);

  // Render cell content
  const renderCell = (column: DataTableColumn<T>, row: T, index: number) => {
    if (column.cell) {
      return column.cell(row[column.key as keyof T], row, index);
    }
    
    const value = row[column.key as keyof T];
    return value != null ? String(value) : "";
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        {searchable && (
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <div className="h-9 bg-muted rounded-md animate-pulse flex-1" />
          </div>
        )}
        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <table className={cn("w-full text-sm", tableClassName)}>
              <thead>
                <tr className="bg-muted/50 border-b">
                  {columns.map((column, index) => (
                    <th 
                      key={index}
                      className={cn(
                        "h-10 px-4 text-left align-middle font-medium text-muted-foreground",
                        column.headerClassName
                      )}
                    >
                      <div className="h-4 bg-muted rounded animate-pulse w-20" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(pageSize)].map((_, index) => (
                  <tr key={index} className="border-b">
                    {columns.map((column, colIndex) => (
                      <td 
                        key={colIndex}
                        className={cn("p-3 align-middle", column.className)}
                      >
                        <div className="h-4 bg-muted rounded animate-pulse w-full" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search */}
      {searchable && (
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {pagination.enabled && pagination.showPageSizeSelector && (
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              {(pagination.pageSizeOptions || [10, 25, 50, 100]).map(size => (
                <option key={size} value={size}>
                  {size} per page
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <table className={cn("w-full text-sm", tableClassName)}>
            <thead>
              <tr className="bg-muted/50 border-b">
                {columns.map((column, index) => (
                  <th 
                    key={index}
                    className={cn(
                      "h-10 px-4 text-left align-middle font-medium text-muted-foreground",
                      (sortable && column.sortable !== false) && "cursor-pointer hover:bg-muted/80 transition-colors",
                      column.headerClassName
                    )}
                    onClick={() => handleSort(column.key as string)}
                    role={sortable && column.sortable !== false ? "button" : undefined}
                    tabIndex={sortable && column.sortable !== false ? 0 : undefined}
                    onKeyDown={(e) => {
                      if ((e.key === "Enter" || e.key === " ") && sortable && column.sortable !== false) {
                        e.preventDefault();
                        handleSort(column.key as string);
                      }
                    }}
                  >
                    <div className="flex items-center">
                      <span>{column.header}</span>
                      {getSortIcon(column.key as string)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="h-24 text-center">
                    {emptyState || (
                      <div className="text-muted-foreground">
                        {searchQuery ? "No results found." : "No data available."}
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, index) => (
                  <tr 
                    key={index}
                    className={cn(
                      "border-b hover:bg-muted/50 transition-colors",
                      onRowClick && "cursor-pointer",
                      rowClassName?.(row, index)
                    )}
                    onClick={() => onRowClick?.(row, index)}
                    role={onRowClick ? "button" : undefined}
                    tabIndex={onRowClick ? 0 : undefined}
                    onKeyDown={(e) => {
                      if ((e.key === "Enter" || e.key === " ") && onRowClick) {
                        e.preventDefault();
                        onRowClick(row, index);
                      }
                    }}
                  >
                    {columns.map((column, colIndex) => (
                      <td 
                        key={colIndex}
                        className={cn("p-3 align-middle", column.className)}
                      >
                        {renderCell(column, row, index)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.enabled && paginatedData.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm">
          <div className="text-muted-foreground">
            Showing {startIndex}-{endIndex} of {sortedData.length} results
            {searchQuery && ` for "${searchQuery}"`}
          </div>
          <div className="flex gap-1">
            <Button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>
            <span className="px-3 py-1.5 rounded-md border bg-muted text-foreground">
              {currentPage} of {totalPages}
            </span>
            <Button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
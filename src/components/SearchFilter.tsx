"use client";

import * as React from "react";
import { 
  Search, 
  Calendar,
  Filter,
  X,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/ui/select";
import { Card, CardContent } from "@/ui/card";
import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface SelectFilter {
  key: string;
  label: string;
  options: FilterOption[];
  placeholder?: string;
  multiple?: boolean;
}

export interface DateRangeFilter {
  key: string;
  label: string;
  type: "date-range";
  startKey?: string;
  endKey?: string;
}

export interface SearchFilterProps {
  // Search functionality
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  
  // Select filters
  selectFilters?: SelectFilter[];
  selectValues?: Record<string, string | string[]>;
  onSelectChange?: (key: string, value: string | string[]) => void;
  
  // Date filters
  dateFilters?: DateRangeFilter[];
  dateValues?: Record<string, string>;
  onDateChange?: (key: string, value: string) => void;
  
  // UI options
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  showClearAll?: boolean;
  className?: string;
  
  // Callbacks
  onClearAll?: () => void;
  onExport?: (filters: Record<string, any>) => void;
}

export function SearchFilter({
  searchValue = "",
  searchPlaceholder = "Search...",
  onSearchChange,
  selectFilters = [],
  selectValues = {},
  onSelectChange,
  dateFilters = [],
  dateValues = {},
  onDateChange,
  collapsible = true,
  defaultCollapsed = false,
  showClearAll = true,
  className,
  onClearAll,
  onExport,
}: SearchFilterProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
  
  // Check if any filters are active
  const hasActiveFilters = React.useMemo(() => {
    if (searchValue.trim()) return true;
    
    // Check select filters
    for (const key of Object.keys(selectValues)) {
      const value = selectValues[key];
      if (Array.isArray(value) ? value.length > 0 : value && value !== "all") {
        return true;
      }
    }
    
    // Check date filters
    for (const key of Object.keys(dateValues)) {
      if (dateValues[key]) return true;
    }
    
    return false;
  }, [searchValue, selectValues, dateValues]);

  // Get all current filter values for export
  const getAllFilters = () => {
    return {
      search: searchValue,
      ...selectValues,
      ...dateValues,
    };
  };

  // Handle clear all filters
  const handleClearAll = () => {
    onSearchChange?.("");
    
    // Clear all select filters
    selectFilters.forEach(filter => {
      onSelectChange?.(filter.key, filter.multiple ? [] : "all");
    });
    
    // Clear all date filters
    dateFilters.forEach(filter => {
      const startKey = filter.startKey || `${filter.key}_start`;
      const endKey = filter.endKey || `${filter.key}_end`;
      onDateChange?.(startKey, "");
      onDateChange?.(endKey, "");
    });
    
    onClearAll?.();
  };

  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header with search and toggle */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Controls */}
            <div className="flex items-center gap-2">
              {/* Active filters indicator */}
              {hasActiveFilters && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Filters active</span>
                </div>
              )}
              
              {/* Export button */}
              {onExport && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onExport(getAllFilters())}
                  disabled={!hasActiveFilters}
                >
                  Export
                </Button>
              )}
              
              {/* Toggle collapse */}
              {collapsible && (selectFilters.length > 0 || dateFilters.length > 0) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {isCollapsed ? "Show" : "Hide"} Filters
                  </span>
                  {isCollapsed ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronUp className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Collapsible filters */}
          {!isCollapsed && (selectFilters.length > 0 || dateFilters.length > 0) && (
            <div className="space-y-4 pt-2 border-t">
              {/* Select Filters */}
              {selectFilters.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {selectFilters.map((filter) => (
                    <div key={filter.key} className="space-y-2">
                      <Label htmlFor={`filter-${filter.key}`} className="text-sm font-medium">
                        {filter.label}
                      </Label>
                      <Select
                        value={
                          Array.isArray(selectValues[filter.key]) 
                            ? (selectValues[filter.key] as string[])?.[0] || "all"
                            : (selectValues[filter.key] as string) || "all"
                        }
                        onValueChange={(value) => onSelectChange?.(filter.key, value)}
                      >
                        <SelectTrigger id={`filter-${filter.key}`}>
                          <SelectValue placeholder={filter.placeholder || `Select ${filter.label.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            All {filter.label}
                            {filter.options.reduce((sum, opt) => sum + (opt.count || 0), 0) > 0 && 
                              ` (${filter.options.reduce((sum, opt) => sum + (opt.count || 0), 0)})`
                            }
                          </SelectItem>
                          {filter.options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                              {option.count !== undefined && ` (${option.count})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              )}

              {/* Date Filters */}
              {dateFilters.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dateFilters.map((filter) => {
                    const startKey = filter.startKey || `${filter.key}_start`;
                    const endKey = filter.endKey || `${filter.key}_end`;
                    
                    return (
                      <div key={filter.key} className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {filter.label}
                        </Label>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label htmlFor={`${filter.key}-start`} className="text-xs text-muted-foreground">
                              From
                            </Label>
                            <Input
                              id={`${filter.key}-start`}
                              type="date"
                              value={dateValues[startKey] || ""}
                              onChange={(e) => onDateChange?.(startKey, e.target.value)}
                              className="text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor={`${filter.key}-end`} className="text-xs text-muted-foreground">
                              To
                            </Label>
                            <Input
                              id={`${filter.key}-end`}
                              type="date"
                              value={dateValues[endKey] || ""}
                              onChange={(e) => onDateChange?.(endKey, e.target.value)}
                              className="text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Clear All Button */}
              {showClearAll && hasActiveFilters && (
                <div className="flex justify-start">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearAll}
                    className="flex items-center gap-2 text-sm"
                  >
                    <X className="h-4 w-4" />
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Active filters summary (when collapsed) */}
          {isCollapsed && hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              {searchValue.trim() && (
                <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                  <Search className="h-3 w-3" />
                  <span>"{searchValue.trim()}"</span>
                </div>
              )}
              
              {selectFilters.map(filter => {
                const value = selectValues[filter.key];
                const isActive = Array.isArray(value) 
                  ? value.length > 0 
                  : value && value !== "all";
                
                if (!isActive) return null;
                
                const displayValue = Array.isArray(value) 
                  ? `${value.length} selected`
                  : filter.options.find(opt => opt.value === value)?.label || value;
                
                return (
                  <div key={filter.key} className="flex items-center gap-1 px-2 py-1 bg-secondary rounded-md text-xs">
                    <span className="text-muted-foreground">{filter.label}:</span>
                    <span>{displayValue}</span>
                  </div>
                );
              })}
              
              {dateFilters.map(filter => {
                const startKey = filter.startKey || `${filter.key}_start`;
                const endKey = filter.endKey || `${filter.key}_end`;
                const startValue = dateValues[startKey];
                const endValue = dateValues[endKey];
                
                if (!startValue && !endValue) return null;
                
                return (
                  <div key={filter.key} className="flex items-center gap-1 px-2 py-1 bg-secondary rounded-md text-xs">
                    <Calendar className="h-3 w-3" />
                    <span className="text-muted-foreground">{filter.label}:</span>
                    <span>
                      {startValue || "∞"} - {endValue || "∞"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
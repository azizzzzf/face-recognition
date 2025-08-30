"use client";

import * as React from "react";
import { 
  Search,
  Plus,
  Inbox,
  Users,
  FileX,
  AlertCircle,
  RefreshCcw,
  Upload,
  Database,
  Zap,
  Settings,
  HelpCircle
} from "lucide-react";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
import { cn } from "@/lib/utils";

export type EmptyStateVariant = 
  | "no-data" 
  | "no-results" 
  | "error" 
  | "loading-failed"
  | "access-denied"
  | "coming-soon"
  | "maintenance";

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: "default" | "outline" | "ghost" | "destructive";
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
}

export interface EmptyStateProps {
  // Content
  title: string;
  description?: string;
  variant?: EmptyStateVariant;
  
  // Visual elements
  icon?: React.ReactNode;
  illustration?: React.ReactNode;
  
  // Actions
  primaryAction?: EmptyStateAction;
  secondaryActions?: EmptyStateAction[];
  
  // Layout
  compact?: boolean;
  centered?: boolean;
  
  // Styling
  className?: string;
  contentClassName?: string;
}

const variantConfig: Record<EmptyStateVariant, {
  defaultIcon: React.ReactNode;
  iconColor: string;
  defaultTitle: string;
}> = {
  "no-data": {
    defaultIcon: <Inbox className="h-12 w-12" />,
    iconColor: "text-muted-foreground",
    defaultTitle: "No Data Available",
  },
  "no-results": {
    defaultIcon: <Search className="h-12 w-12" />,
    iconColor: "text-muted-foreground", 
    defaultTitle: "No Results Found",
  },
  "error": {
    defaultIcon: <AlertCircle className="h-12 w-12" />,
    iconColor: "text-destructive",
    defaultTitle: "Something Went Wrong",
  },
  "loading-failed": {
    defaultIcon: <RefreshCcw className="h-12 w-12" />,
    iconColor: "text-yellow-600",
    defaultTitle: "Failed to Load",
  },
  "access-denied": {
    defaultIcon: <Users className="h-12 w-12" />,
    iconColor: "text-red-600",
    defaultTitle: "Access Denied",
  },
  "coming-soon": {
    defaultIcon: <Zap className="h-12 w-12" />,
    iconColor: "text-blue-600",
    defaultTitle: "Coming Soon",
  },
  "maintenance": {
    defaultIcon: <Settings className="h-12 w-12" />,
    iconColor: "text-orange-600",
    defaultTitle: "Under Maintenance",
  },
};

export function EmptyState({
  title,
  description,
  variant = "no-data",
  icon,
  illustration,
  primaryAction,
  secondaryActions = [],
  compact = false,
  centered = true,
  className,
  contentClassName,
}: EmptyStateProps) {
  const config = variantConfig[variant];
  const displayIcon = icon || config.defaultIcon;

  const content = (
    <div className={cn(
      "flex flex-col items-center text-center space-y-4",
      compact ? "py-8" : "py-12",
      contentClassName
    )}>
      {/* Illustration or Icon */}
      {illustration || (
        <div className={cn(
          "flex items-center justify-center rounded-full bg-muted",
          compact ? "w-16 h-16" : "w-20 h-20"
        )}>
          <div className={cn(config.iconColor, compact && "scale-75")}>
            {displayIcon}
          </div>
        </div>
      )}

      {/* Title and Description */}
      <div className="space-y-2">
        <h3 className={cn(
          "font-semibold text-foreground",
          compact ? "text-lg" : "text-xl"
        )}>
          {title}
        </h3>
        
        {description && (
          <p className={cn(
            "text-muted-foreground max-w-md mx-auto",
            compact ? "text-sm" : "text-base"
          )}>
            {description}
          </p>
        )}
      </div>

      {/* Actions */}
      {(primaryAction || secondaryActions.length > 0) && (
        <div className={cn(
          "flex flex-col sm:flex-row items-center gap-3 pt-2",
          compact && "pt-1"
        )}>
          {primaryAction && (
            <Button
              onClick={primaryAction.onClick}
              variant={primaryAction.variant || "default"}
              disabled={primaryAction.disabled || primaryAction.loading}
              className="flex items-center gap-2"
            >
              {primaryAction.loading ? (
                <RefreshCcw className="h-4 w-4 animate-spin" />
              ) : primaryAction.icon}
              {primaryAction.label}
            </Button>
          )}
          
          {secondaryActions.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              variant={action.variant || "outline"}
              size={compact ? "sm" : "default"}
              disabled={action.disabled || action.loading}
              className="flex items-center gap-2"
            >
              {action.loading ? (
                <RefreshCcw className="h-4 w-4 animate-spin" />
              ) : action.icon}
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );

  if (centered) {
    return (
      <div className={cn("flex items-center justify-center w-full", className)}>
        <div className="w-full max-w-md">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {content}
    </div>
  );
}

// Specialized empty state components
export function NoDataEmptyState({
  title = "No Data Available",
  description = "There's no data to display yet. Get started by adding your first item.",
  onAddItem,
  addItemLabel = "Add Item",
  ...props
}: Omit<EmptyStateProps, "variant"> & {
  onAddItem?: () => void;
  addItemLabel?: string;
}) {
  return (
    <EmptyState
      variant="no-data"
      title={title}
      description={description}
      primaryAction={onAddItem ? {
        label: addItemLabel,
        onClick: onAddItem,
        icon: <Plus className="h-4 w-4" />
      } : undefined}
      {...props}
    />
  );
}

export function NoResultsEmptyState({
  title = "No Results Found", 
  description = "We couldn't find anything matching your search. Try adjusting your filters or search terms.",
  onClearFilters,
  onRetry,
  searchQuery,
  ...props
}: Omit<EmptyStateProps, "variant"> & {
  onClearFilters?: () => void;
  onRetry?: () => void;
  searchQuery?: string;
}) {
  const actions: EmptyStateAction[] = [];
  
  if (onClearFilters) {
    actions.push({
      label: "Clear Filters",
      onClick: onClearFilters,
      variant: "outline",
      icon: <RefreshCcw className="h-4 w-4" />
    });
  }
  
  if (onRetry) {
    actions.push({
      label: "Try Again",
      onClick: onRetry,
      variant: "outline",
      icon: <Search className="h-4 w-4" />
    });
  }

  return (
    <EmptyState
      variant="no-results"
      title={title}
      description={searchQuery 
        ? `No results found for "${searchQuery}". ${description}`
        : description
      }
      secondaryActions={actions}
      {...props}
    />
  );
}

export function ErrorEmptyState({
  title = "Something Went Wrong",
  description = "We encountered an error while loading the data. Please try again.",
  onRetry,
  onSupport,
  error,
  ...props
}: Omit<EmptyStateProps, "variant"> & {
  onRetry?: () => void;
  onSupport?: () => void;
  error?: Error | string;
}) {
  const actions: EmptyStateAction[] = [];
  
  if (onRetry) {
    actions.push({
      label: "Try Again",
      onClick: onRetry,
      variant: "default",
      icon: <RefreshCcw className="h-4 w-4" />
    });
  }
  
  if (onSupport) {
    actions.push({
      label: "Contact Support",
      onClick: onSupport,
      variant: "outline",
      icon: <HelpCircle className="h-4 w-4" />
    });
  }

  return (
    <EmptyState
      variant="error"
      title={title}
      description={
        error 
          ? `${description} Error: ${typeof error === 'string' ? error : error.message}`
          : description
      }
      primaryAction={actions[0]}
      secondaryActions={actions.slice(1)}
      {...props}
    />
  );
}

export function LoadingFailedEmptyState({
  title = "Failed to Load Data",
  description = "We couldn't load the data. Please check your connection and try again.",
  onRetry,
  onRefresh,
  ...props
}: Omit<EmptyStateProps, "variant"> & {
  onRetry?: () => void;
  onRefresh?: () => void;
}) {
  const actions: EmptyStateAction[] = [];
  
  if (onRetry) {
    actions.push({
      label: "Retry",
      onClick: onRetry,
      variant: "default",
      icon: <RefreshCcw className="h-4 w-4" />
    });
  }
  
  if (onRefresh) {
    actions.push({
      label: "Refresh Page", 
      onClick: onRefresh,
      variant: "outline",
      icon: <RefreshCcw className="h-4 w-4" />
    });
  }

  return (
    <EmptyState
      variant="loading-failed"
      title={title}
      description={description}
      primaryAction={actions[0]}
      secondaryActions={actions.slice(1)}
      {...props}
    />
  );
}

export function AccessDeniedEmptyState({
  title = "Access Denied",
  description = "You don't have permission to view this content. Contact your administrator if you believe this is an error.",
  onGoBack,
  onContactAdmin,
  ...props
}: Omit<EmptyStateProps, "variant"> & {
  onGoBack?: () => void;
  onContactAdmin?: () => void;
}) {
  const actions: EmptyStateAction[] = [];
  
  if (onGoBack) {
    actions.push({
      label: "Go Back",
      onClick: onGoBack,
      variant: "default"
    });
  }
  
  if (onContactAdmin) {
    actions.push({
      label: "Contact Admin",
      onClick: onContactAdmin,
      variant: "outline"
    });
  }

  return (
    <EmptyState
      variant="access-denied"
      title={title}
      description={description}
      primaryAction={actions[0]}
      secondaryActions={actions.slice(1)}
      {...props}
    />
  );
}

// Table-specific empty state
export function TableEmptyState({
  searchQuery,
  hasFilters,
  onClearFilters,
  onAddItem,
  ...props
}: {
  searchQuery?: string;
  hasFilters?: boolean;
  onClearFilters?: () => void;
  onAddItem?: () => void;
} & Omit<EmptyStateProps, "variant" | "primaryAction" | "secondaryActions">) {
  if (searchQuery || hasFilters) {
    return (
      <NoResultsEmptyState
        searchQuery={searchQuery}
        onClearFilters={onClearFilters}
        {...props}
      />
    );
  }

  return (
    <NoDataEmptyState
      onAddItem={onAddItem}
      {...props}
    />
  );
}
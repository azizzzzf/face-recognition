"use client";

import * as React from "react";
import { 
  TrendingUp, 
  TrendingDown,
  Minus,
  ArrowUp,
  ArrowDown,
  MoreVertical
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type StatCardVariant = "default" | "primary" | "success" | "warning" | "danger" | "info";
export type TrendDirection = "up" | "down" | "neutral";

export interface StatCardProps {
  // Content
  title: string;
  value: string | number;
  subtitle?: string;
  description?: string;
  
  // Trend indicators
  trend?: {
    direction: TrendDirection;
    value: number | string;
    label?: string;
    period?: string; // e.g., "vs last month"
  };
  
  // Visual elements
  icon?: React.ReactNode;
  variant?: StatCardVariant;
  
  // Loading state
  loading?: boolean;
  
  // Actions
  onAction?: () => void;
  actionLabel?: string;
  
  // Layout
  compact?: boolean;
  className?: string;
  contentClassName?: string;
}

const variantStyles: Record<StatCardVariant, {
  cardClass: string;
  iconClass: string;
  trendUpClass: string;
  trendDownClass: string;
}> = {
  default: {
    cardClass: "border-border",
    iconClass: "text-muted-foreground",
    trendUpClass: "text-green-600 bg-green-50 dark:bg-green-950/20",
    trendDownClass: "text-red-600 bg-red-50 dark:bg-red-950/20",
  },
  primary: {
    cardClass: "border-primary/20 bg-primary/5",
    iconClass: "text-primary",
    trendUpClass: "text-green-600 bg-green-50 dark:bg-green-950/20",
    trendDownClass: "text-red-600 bg-red-50 dark:bg-red-950/20",
  },
  success: {
    cardClass: "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20",
    iconClass: "text-green-600 dark:text-green-400",
    trendUpClass: "text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-300",
    trendDownClass: "text-red-600 bg-red-50 dark:bg-red-950/20",
  },
  warning: {
    cardClass: "border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-950/20",
    iconClass: "text-yellow-600 dark:text-yellow-400",
    trendUpClass: "text-green-600 bg-green-50 dark:bg-green-950/20",
    trendDownClass: "text-red-600 bg-red-50 dark:bg-red-950/20",
  },
  danger: {
    cardClass: "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20",
    iconClass: "text-red-600 dark:text-red-400",
    trendUpClass: "text-green-600 bg-green-50 dark:bg-green-950/20",
    trendDownClass: "text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-300",
  },
  info: {
    cardClass: "border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20",
    iconClass: "text-blue-600 dark:text-blue-400",
    trendUpClass: "text-green-600 bg-green-50 dark:bg-green-950/20",
    trendDownClass: "text-red-600 bg-red-50 dark:bg-red-950/20",
  },
};

export function StatCard({
  title,
  value,
  subtitle,
  description,
  trend,
  icon,
  variant = "default",
  loading = false,
  onAction,
  actionLabel = "View Details",
  compact = false,
  className,
  contentClassName,
}: StatCardProps) {
  const styles = variantStyles[variant];

  // Format large numbers
  const formatValue = (val: string | number) => {
    if (typeof val === "string") return val;
    
    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(1)}M`;
    } else if (val >= 1000) {
      return `${(val / 1000).toFixed(1)}K`;
    }
    return val.toLocaleString();
  };

  // Get trend icon and styling
  const getTrendInfo = () => {
    if (!trend) return null;

    const isPositive = trend.direction === "up";
    const isNegative = trend.direction === "down";
    const isNeutral = trend.direction === "neutral";

    let trendIcon;
    let trendClass;

    if (isPositive) {
      trendIcon = <ArrowUp className="h-3 w-3" />;
      trendClass = styles.trendUpClass;
    } else if (isNegative) {
      trendIcon = <ArrowDown className="h-3 w-3" />;
      trendClass = styles.trendDownClass;
    } else {
      trendIcon = <Minus className="h-3 w-3" />;
      trendClass = "text-muted-foreground bg-muted";
    }

    return {
      icon: trendIcon,
      className: trendClass,
      direction: trend.direction,
    };
  };

  const trendInfo = getTrendInfo();

  if (loading) {
    return (
      <Card className={cn(styles.cardClass, className)}>
        <CardContent className={cn("p-6", compact && "p-4", contentClassName)}>
          <div className="animate-pulse space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-muted rounded w-24"></div>
              {icon && <div className="h-5 w-5 bg-muted rounded"></div>}
            </div>
            <div className="h-8 bg-muted rounded w-20"></div>
            {!compact && (
              <>
                <div className="h-3 bg-muted rounded w-16"></div>
                <div className="h-3 bg-muted rounded w-32"></div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(styles.cardClass, className)}>
      <CardContent className={cn("p-6", compact && "p-4", contentClassName)}>
        <div className="flex items-start justify-between space-x-3">
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between">
              <p className={cn(
                "text-sm font-medium text-muted-foreground truncate",
                compact && "text-xs"
              )}>
                {title}
              </p>
              {onAction && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onAction}
                  className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                  aria-label={actionLabel}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Value */}
            <div className="flex items-center space-x-2 mt-1">
              <p className={cn(
                "text-2xl font-bold text-foreground",
                compact && "text-xl"
              )}>
                {formatValue(value)}
              </p>
              
              {/* Trend Indicator */}
              {trend && trendInfo && (
                <Badge
                  variant="secondary"
                  className={cn(
                    "flex items-center space-x-1 px-2 py-1 text-xs font-medium",
                    trendInfo.className,
                    compact && "text-xs px-1.5 py-0.5"
                  )}
                >
                  {trendInfo.icon}
                  <span>{trend.value}%</span>
                </Badge>
              )}
            </div>

            {/* Subtitle and Description */}
            {!compact && (
              <div className="mt-2 space-y-1">
                {subtitle && (
                  <p className="text-sm text-muted-foreground">
                    {subtitle}
                  </p>
                )}
                
                {description && (
                  <p className="text-xs text-muted-foreground">
                    {description}
                  </p>
                )}
                
                {trend?.label && (
                  <p className="text-xs text-muted-foreground">
                    {trend.label}
                    {trend.period && ` ${trend.period}`}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Icon */}
          {icon && (
            <div className={cn(
              "flex-shrink-0",
              styles.iconClass,
              compact ? "text-base" : "text-lg"
            )}>
              {icon}
            </div>
          )}
        </div>

        {/* Compact trend info */}
        {compact && trend?.label && (
          <p className="text-xs text-muted-foreground mt-2">
            {trend.label}
            {trend.period && ` ${trend.period}`}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Specialized stat cards
export function MetricCard({
  metric,
  ...props
}: Omit<StatCardProps, "title" | "value"> & {
  metric: {
    label: string;
    value: string | number;
    change?: number;
    changeLabel?: string;
  };
}) {
  return (
    <StatCard
      title={metric.label}
      value={metric.value}
      trend={
        metric.change !== undefined
          ? {
              direction: metric.change > 0 ? "up" : metric.change < 0 ? "down" : "neutral",
              value: Math.abs(metric.change),
              label: metric.changeLabel,
            }
          : undefined
      }
      {...props}
    />
  );
}

export function KPICard({
  kpi,
  ...props
}: Omit<StatCardProps, "title" | "value" | "subtitle" | "trend"> & {
  kpi: {
    name: string;
    current: number;
    target?: number;
    change?: number;
    period?: string;
  };
}) {
  const progress = kpi.target ? (kpi.current / kpi.target) * 100 : undefined;
  const variant: StatCardVariant = 
    progress ? (progress >= 100 ? "success" : progress >= 75 ? "warning" : "danger") : "default";

  return (
    <StatCard
      title={kpi.name}
      value={kpi.current}
      subtitle={kpi.target ? `Target: ${kpi.target}` : undefined}
      variant={variant}
      trend={
        kpi.change !== undefined
          ? {
              direction: kpi.change > 0 ? "up" : kpi.change < 0 ? "down" : "neutral",
              value: Math.abs(kpi.change),
              period: kpi.period,
            }
          : undefined
      }
      {...props}
    />
  );
}
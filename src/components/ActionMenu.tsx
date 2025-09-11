"use client";

import * as React from "react";
import { 
  MoreVertical, 
  ChevronDown,
  Check
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/ui/dropdown-menu";
import { Button } from "@/ui/button";
import { ConfirmDialog } from "./ConfirmDialog";
import { cn } from "@/lib/utils";

export interface ActionMenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void | Promise<void>;
  disabled?: boolean;
  variant?: "default" | "destructive" | "success" | "warning";
  
  // Confirmation dialog for dangerous actions
  confirm?: {
    title: string;
    description?: string;
    confirmText?: string;
  };
  
  // Submenu support
  items?: ActionMenuItem[];
}

export interface ActionMenuGroup {
  label?: string;
  items: ActionMenuItem[];
}

export interface ActionMenuProps {
  // Menu items - can be flat array or grouped
  items?: ActionMenuItem[];
  groups?: ActionMenuGroup[];
  
  // Trigger customization
  trigger?: React.ReactNode;
  triggerVariant?: "ghost" | "outline" | "default";
  triggerSize?: "sm" | "default" | "lg" | "icon";
  triggerClassName?: string;
  
  // Menu positioning
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  
  // Loading state
  loading?: boolean;
  disabled?: boolean;
  
  // Events
  onOpenChange?: (open: boolean) => void;
  
  // Styling
  className?: string;
  contentClassName?: string;
}

const itemVariantStyles = {
  default: "text-foreground hover:bg-accent",
  destructive: "text-destructive hover:bg-destructive/10 focus:bg-destructive/10",
  success: "text-green-600 hover:bg-green-50 focus:bg-green-50 dark:text-green-400 dark:hover:bg-green-950/20",
  warning: "text-yellow-600 hover:bg-yellow-50 focus:bg-yellow-50 dark:text-yellow-400 dark:hover:bg-yellow-950/20",
};

export function ActionMenu({
  items = [],
  groups = [],
  trigger,
  triggerVariant = "ghost",
  triggerSize = "icon",
  triggerClassName,
  align = "end",
  side = "bottom",
  loading = false,
  disabled = false,
  onOpenChange,
  className,
  contentClassName,
}: ActionMenuProps) {
  const [confirmDialog, setConfirmDialog] = React.useState<{
    open: boolean;
    item: ActionMenuItem | null;
  }>({ open: false, item: null });

  // Combine items and groups into a single structure
  const menuStructure = React.useMemo(() => {
    const structure: (ActionMenuItem | { type: "separator" } | { type: "group"; label: string; items: ActionMenuItem[] })[] = [];
    
    // Add direct items
    if (items.length > 0) {
      structure.push(...items);
    }
    
    // Add groups
    groups.forEach((group) => {
      if (structure.length > 0 && group.items.length > 0) {
        structure.push({ type: "separator" });
      }
      
      if (group.label) {
        structure.push({ type: "group", label: group.label, items: group.items });
      } else {
        structure.push(...group.items);
      }
    });
    
    return structure;
  }, [items, groups]);

  const handleItemClick = async (item: ActionMenuItem) => {
    if (item.disabled || !item.onClick) return;

    // Show confirmation dialog if required
    if (item.confirm) {
      setConfirmDialog({ open: true, item });
      return;
    }

    // Execute action directly
    try {
      await item.onClick();
    } catch (error) {
      console.error("Action failed:", error);
    }
  };

  const handleConfirmedAction = async () => {
    if (!confirmDialog.item?.onClick) return;

    try {
      await confirmDialog.item.onClick();
      setConfirmDialog({ open: false, item: null });
    } catch (error) {
      console.error("Confirmed action failed:", error);
    }
  };

  const renderTrigger = () => {
    if (trigger) return trigger;

    return (
      <Button
        variant={triggerVariant}
        size={triggerSize}
        disabled={disabled || loading}
        className={triggerClassName}
      >
        <MoreVertical className="h-4 w-4" />
        <span className="sr-only">Open menu</span>
      </Button>
    );
  };

  const renderMenuItem = (item: ActionMenuItem) => {
    const hasSubmenu = item.items && item.items.length > 0;
    
    if (hasSubmenu) {
      return (
        <DropdownMenuSub key={item.key}>
          <DropdownMenuSubTrigger
            className={cn(
              "flex items-center gap-2",
              item.variant && itemVariantStyles[item.variant]
            )}
            disabled={item.disabled}
          >
            {item.icon && (
              <span className="flex-shrink-0">
                {item.icon}
              </span>
            )}
            <span>{item.label}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {item.items!.map(renderMenuItem)}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      );
    }

    return (
      <DropdownMenuItem
        key={item.key}
        onClick={() => handleItemClick(item)}
        disabled={item.disabled}
        className={cn(
          "flex items-center gap-2 cursor-pointer",
          item.variant && itemVariantStyles[item.variant]
        )}
      >
        {item.icon && (
          <span className="flex-shrink-0">
            {item.icon}
          </span>
        )}
        <span>{item.label}</span>
      </DropdownMenuItem>
    );
  };

  const renderStructureItem = (structureItem: ActionMenuItem | { type: "separator" } | { type: "group"; label: string; items: ActionMenuItem[] }, index: number) => {
    if ('type' in structureItem && structureItem.type === "separator") {
      return <DropdownMenuSeparator key={`separator-${index}`} />;
    }
    
    if ('type' in structureItem && structureItem.type === "group") {
      return (
        <DropdownMenuGroup key={`group-${index}`}>
          <DropdownMenuLabel>{structureItem.label}</DropdownMenuLabel>
          {structureItem.items?.map(renderMenuItem)}
        </DropdownMenuGroup>
      );
    }
    
    return renderMenuItem(structureItem as ActionMenuItem);
  };

  if (menuStructure.length === 0) {
    return null;
  }

  return (
    <>
      <DropdownMenu onOpenChange={onOpenChange}>
        <DropdownMenuTrigger asChild className={className}>
          {renderTrigger()}
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align={align} 
          side={side}
          className={cn("w-56", contentClassName)}
        >
          {menuStructure.map(renderStructureItem)}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ open, item: null })}
        title={confirmDialog.item?.confirm?.title || "Confirm Action"}
        description={confirmDialog.item?.confirm?.description}
        confirmText={confirmDialog.item?.confirm?.confirmText || "Confirm"}
        variant={confirmDialog.item?.variant === "destructive" ? "danger" : "default"}
        onConfirm={handleConfirmedAction}
      />
    </>
  );
}

// Specialized action menus
export function TableRowActionMenu({
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  customActions = [],
  viewDisabled = false,
  editDisabled = false,
  deleteDisabled = false,
  duplicateDisabled = false,
  ...props
}: Omit<ActionMenuProps, "items"> & {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  customActions?: ActionMenuItem[];
  viewDisabled?: boolean;
  editDisabled?: boolean;
  deleteDisabled?: boolean;
  duplicateDisabled?: boolean;
}) {
  const items: ActionMenuItem[] = [
    ...(onView ? [{
      key: "view",
      label: "View Details",
      icon: <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
      onClick: onView,
      disabled: viewDisabled,
    }] : []),
    
    ...(onEdit ? [{
      key: "edit",
      label: "Edit",
      icon: <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
      onClick: onEdit,
      disabled: editDisabled,
    }] : []),
    
    ...(onDuplicate ? [{
      key: "duplicate",
      label: "Duplicate",
      icon: <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
      onClick: onDuplicate,
      disabled: duplicateDisabled,
    }] : []),
    
    ...customActions,
    
    ...(onDelete ? [{
      key: "delete",
      label: "Delete",
      icon: <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
      onClick: onDelete,
      disabled: deleteDisabled,
      variant: "destructive" as const,
      confirm: {
        title: "Delete Item",
        description: "This action cannot be undone. Are you sure you want to delete this item?",
        confirmText: "Delete",
      },
    }] : []),
  ];

  return <ActionMenu items={items} {...props} />;
}

export function BulkActionMenu({
  selectedCount,
  onSelectAll,
  onDeselectAll,
  onBulkDelete,
  onBulkExport,
  customActions = [],
  ...props
}: Omit<ActionMenuProps, "items"> & {
  selectedCount: number;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  onBulkDelete?: () => void;
  onBulkExport?: () => void;
  customActions?: ActionMenuItem[];
}) {
  const items: ActionMenuItem[] = [
    ...(onSelectAll ? [{
      key: "select-all",
      label: "Select All",
      icon: <Check className="h-4 w-4" />,
      onClick: onSelectAll,
    }] : []),
    
    ...(onDeselectAll && selectedCount > 0 ? [{
      key: "deselect-all",
      label: "Deselect All",
      icon: <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
      onClick: onDeselectAll,
    }] : []),
    
    ...customActions,
    
    ...(onBulkExport && selectedCount > 0 ? [{
      key: "bulk-export",
      label: `Export ${selectedCount} items`,
      icon: <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
      onClick: onBulkExport,
    }] : []),
    
    ...(onBulkDelete && selectedCount > 0 ? [{
      key: "bulk-delete",
      label: `Delete ${selectedCount} items`,
      icon: <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
      onClick: onBulkDelete,
      variant: "destructive" as const,
      confirm: {
        title: "Delete Items",
        description: `Are you sure you want to delete ${selectedCount} items? This action cannot be undone.`,
        confirmText: "Delete All",
      },
    }] : []),
  ];

  return (
    <ActionMenu 
      items={items}
      trigger={
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <span>{selectedCount} selected</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      }
      {...props} 
    />
  );
}
"use client";

import * as React from "react";
import { 
  AlertTriangle, 
  Info, 
  Trash2, 
  AlertCircle,
  Loader2 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ConfirmDialogVariant = "danger" | "warning" | "info" | "default";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  variant?: ConfirmDialogVariant;
  
  // Action buttons
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  
  // Loading state
  loading?: boolean;
  disabled?: boolean;
  
  // Icon customization
  icon?: React.ReactNode | boolean;
  
  // Footer customization
  footer?: React.ReactNode;
  hideCancel?: boolean;
  
  // Keyboard shortcuts
  confirmOnEnter?: boolean;
  cancelOnEscape?: boolean;
  
  // Additional props
  className?: string;
  confirmButtonClassName?: string;
  cancelButtonClassName?: string;
}

const variantIcons: Record<ConfirmDialogVariant, React.ReactNode> = {
  danger: <AlertTriangle className="h-6 w-6 text-destructive" />,
  warning: <AlertCircle className="h-6 w-6 text-yellow-600" />,
  info: <Info className="h-6 w-6 text-blue-600" />,
  default: <AlertCircle className="h-6 w-6 text-muted-foreground" />,
};

const variantStyles: Record<ConfirmDialogVariant, {
  confirmButton: string;
  headerClass: string;
}> = {
  danger: {
    confirmButton: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    headerClass: "text-destructive",
  },
  warning: {
    confirmButton: "bg-yellow-600 text-white hover:bg-yellow-700",
    headerClass: "text-yellow-600",
  },
  info: {
    confirmButton: "bg-blue-600 text-white hover:bg-blue-700",
    headerClass: "text-blue-600",
  },
  default: {
    confirmButton: "bg-primary text-primary-foreground hover:bg-primary/90",
    headerClass: "text-foreground",
  },
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  variant = "default",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
  disabled = false,
  icon,
  footer,
  hideCancel = false,
  confirmOnEnter = true,
  cancelOnEscape = true,
  className,
  confirmButtonClassName,
  cancelButtonClassName,
}: ConfirmDialogProps) {
  const [isConfirming, setIsConfirming] = React.useState(false);
  
  const handleConfirm = async () => {
    if (disabled || isConfirming) return;
    
    setIsConfirming(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error("Error in confirm action:", error);
      // Let the parent component handle the error
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancel = () => {
    if (isConfirming) return;
    onCancel?.();
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isConfirming) {
      onOpenChange(false);
    }
  };

  // Keyboard event handler
  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (confirmOnEnter && event.key === "Enter" && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        handleConfirm();
      } else if (cancelOnEscape && event.key === "Escape") {
        event.preventDefault();
        handleCancel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, confirmOnEnter, cancelOnEscape, isConfirming]); // eslint-disable-line react-hooks/exhaustive-deps

  const styles = variantStyles[variant];
  const isLoading = loading || isConfirming;

  // Determine which icon to show
  const renderIcon = () => {
    if (icon === false) return null;
    if (React.isValidElement(icon)) return icon;
    if (icon === true || icon === undefined) return variantIcons[variant];
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={cn("sm:max-w-md", className)}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            {renderIcon()}
            <div className="flex-1 space-y-1">
              <DialogTitle className={cn(styles.headerClass)}>
                {title}
              </DialogTitle>
              {description && (
                <DialogDescription>
                  {description}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        {children && (
          <div className="py-4">
            {children}
          </div>
        )}

        {footer || (
          <DialogFooter className="sm:justify-end">
            {!hideCancel && (
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
                className={cancelButtonClassName}
              >
                {cancelText}
              </Button>
            )}
            <Button
              onClick={handleConfirm}
              disabled={disabled || isLoading}
              className={cn(styles.confirmButton, confirmButtonClassName)}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {confirmText}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Specialized confirm dialogs for common use cases
export function DeleteConfirmDialog({
  open,
  onOpenChange,
  title = "Delete Item",
  description = "This action cannot be undone. Are you sure you want to delete this item?",
  itemName,
  onConfirm,
  ...props
}: Omit<ConfirmDialogProps, "variant" | "confirmText" | "icon"> & {
  itemName?: string;
}) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      confirmText="Delete"
      variant="danger"
      icon={<Trash2 className="h-6 w-6 text-destructive" />}
      onConfirm={onConfirm}
      {...props}
    >
      {itemName && (
        <div className="p-3 bg-muted rounded-lg">
          <p className="font-medium text-sm">{itemName}</p>
          <p className="text-xs text-muted-foreground mt-1">
            This item will be permanently deleted
          </p>
        </div>
      )}
    </ConfirmDialog>
  );
}

export function UnsavedChangesDialog({
  open,
  onOpenChange,
  onConfirm,
  onDiscard,
  ...props
}: Omit<ConfirmDialogProps, "variant" | "confirmText" | "cancelText" | "onCancel"> & {
  onDiscard?: () => void;
}) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Unsaved Changes"
      description="You have unsaved changes. What would you like to do?"
      confirmText="Save Changes"
      cancelText="Discard Changes"
      variant="warning"
      onConfirm={onConfirm}
      onCancel={onDiscard}
      {...props}
    />
  );
}

export function LogoutConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  ...props
}: Omit<ConfirmDialogProps, "variant" | "confirmText" | "title" | "description">) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Sign Out"
      description="Are you sure you want to sign out? Any unsaved work will be lost."
      confirmText="Sign Out"
      variant="warning"
      onConfirm={onConfirm}
      {...props}
    />
  );
}

// Hook for managing confirm dialog state
export function useConfirmDialog() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [config, setConfig] = React.useState<Partial<ConfirmDialogProps>>({});

  const openDialog = (dialogConfig: Partial<ConfirmDialogProps>) => {
    setConfig(dialogConfig);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setConfig({});
  };

  return {
    isOpen,
    config,
    openDialog,
    closeDialog,
  };
}
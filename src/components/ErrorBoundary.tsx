"use client";

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Alert, AlertDescription } from '@/ui/alert';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  showDetails?: boolean;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to console for debugging
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
      }));
    }
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportError = () => {
    const errorMessage = this.state.error?.message || 'Unknown error';
    const errorStack = this.state.error?.stack || 'No stack trace';
    const componentStack = this.state.errorInfo?.componentStack || 'No component stack';
    
    const reportData = {
      error: errorMessage,
      stack: errorStack,
      componentStack: componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    };

    // Here you could send to an error reporting service
    console.log('Error report:', reportData);
    
    // For now, just copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(reportData, null, 2))
      .then(() => {
        alert('Error details copied to clipboard');
      })
      .catch(() => {
        alert('Unable to copy error details');
      });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const canRetry = this.state.retryCount < this.maxRetries;
      const errorMessage = this.state.error?.message || 'Something went wrong';
      
      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-4">
                  <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <CardTitle className="text-xl font-semibold">
                Oops! Terjadi Kesalahan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-red-200 dark:border-red-800">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Error:</strong> {errorMessage}
                </AlertDescription>
              </Alert>

              {this.props.showDetails && this.state.error && (
                <details className="bg-muted rounded-lg p-4">
                  <summary className="cursor-pointer font-medium mb-2 text-sm">
                    Detail Error (untuk Developer)
                  </summary>
                  <pre className="text-xs overflow-auto max-h-40 bg-background rounded p-2 mt-2">
                    {this.state.error.stack}
                  </pre>
                  {this.state.errorInfo?.componentStack && (
                    <pre className="text-xs overflow-auto max-h-40 bg-background rounded p-2 mt-2">
                      Component Stack:
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </details>
              )}

              <div className="text-center text-sm text-muted-foreground">
                {this.state.retryCount > 0 && (
                  <p className="mb-2">
                    Percobaan ke-{this.state.retryCount} dari {this.maxRetries}
                  </p>
                )}
                <p>
                  Jika masalah terus berlanjut, silakan hubungi administrator sistem.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {canRetry && (
                  <Button 
                    onClick={this.handleRetry} 
                    variant="default"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Coba Lagi
                  </Button>
                )}
                
                <Button 
                  onClick={this.handleGoHome} 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Kembali ke Beranda
                </Button>

                {this.props.showDetails && (
                  <Button 
                    onClick={this.handleReportError} 
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Bug className="h-4 w-4" />
                    Laporkan Error
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export const useErrorHandler = () => {
  const handleError = React.useCallback((error: Error, errorInfo?: Record<string, unknown>) => {
    console.error('Error handled by useErrorHandler:', error, errorInfo);
    
    // You could integrate with error reporting services here
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }, []);

  return handleError;
};

// Simple error fallback component for specific use cases
export const SimpleErrorFallback: React.FC<{
  error?: Error;
  resetError?: () => void;
  title?: string;
  description?: string;
}> = ({ 
  error, 
  resetError, 
  title = "Something went wrong", 
  description = "An error occurred while loading this content." 
}) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground mb-4">{description}</p>
    {error && (
      <p className="text-sm text-red-600 mb-4 font-mono">
        {error.message}
      </p>
    )}
    {resetError && (
      <Button onClick={resetError} variant="outline" size="sm">
        <RefreshCw className="h-4 w-4 mr-2" />
        Try Again
      </Button>
    )}
  </div>
);

// Network error specific component
export const NetworkErrorFallback: React.FC<{
  onRetry?: () => void;
  title?: string;
}> = ({ 
  onRetry, 
  title = "Network Error" 
}) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="rounded-full bg-orange-100 dark:bg-orange-900/20 p-4 mb-4">
      <AlertTriangle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground mb-4">
      Unable to connect to the server. Please check your internet connection.
    </p>
    {onRetry && (
      <Button onClick={onRetry} variant="default" size="sm">
        <RefreshCw className="h-4 w-4 mr-2" />
        Retry
      </Button>
    )}
  </div>
);

export default ErrorBoundary;
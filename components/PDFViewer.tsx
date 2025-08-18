'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";

interface PDFViewerProps {
  url: string;
  title?: string;
  height?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ url, title = 'PDF Document', height = '100%' }) => {
  const [isClient, setIsClient] = useState(false);
  const [pdf, setPdf] = useState<any>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.2); // Start with better quality
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null); // Track current render task for cancellation
  const containerRef = useRef<HTMLDivElement>(null);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check if URL is a GitHub raw URL
  const isGitHubRawUrl = (url: string) => {
    return url.includes('raw.githubusercontent.com');
  };

  // Convert GitHub URL to proxy URL
  const getProxyUrl = (originalUrl: string) => {
    if (isGitHubRawUrl(originalUrl)) {
      return `/api/proxy?url=${encodeURIComponent(originalUrl)}`;
    }
    return originalUrl;
  };

  // Load PDF.js and PDF document using proxy
  useEffect(() => {
    if (!isClient || !url) return;

    const loadPDF = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use proxy URL for GitHub files
        const pdfUrl = getProxyUrl(url);
        console.log('Loading PDF from:', pdfUrl);

        // Dynamic import of pdfjs-dist - only on client side
        const pdfjsLib = await import('pdfjs-dist');

        // Set up worker
        if (typeof window !== 'undefined') {
          pdfjsLib.GlobalWorkerOptions.workerSrc =
            window.location.origin + '/pdf.worker.min.js';
        }

        // Load the PDF document
        const loadingTask = pdfjsLib.getDocument({
          url: pdfUrl,
          withCredentials: false,
        });

        const pdfDoc = await loadingTask.promise;

        setPdf(pdfDoc);
        setNumPages(pdfDoc.numPages);
        setPageNumber(1);
        setLoading(false);
      } catch (error: any) {
        console.error('Error loading PDF:', error);

        let errorMessage = 'Failed to load PDF. Please try again.';

        if (isGitHubRawUrl(url)) {
          if (error.message?.includes('404') || error.message?.includes('Failed to fetch')) {
            errorMessage = `GitHub file not available yet. This could mean:
• The file is still being processed by GitHub (takes 2-3 minutes)
• The file name contains special characters
• The upload may have failed

Try refreshing the page or re-uploading the file.`;
          }
        }

        setError(errorMessage);
        setLoading(false);
      }
    };

    loadPDF();

    // Cleanup function to cancel any pending render tasks
    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
    };
  }, [url, isClient]);

  // Render page when pdf, pageNumber, scale, or rotation changes
  useEffect(() => {
    if (!pdf || !canvasRef.current || !isClient) return;

    const renderPage = async () => {
      try {
        // Cancel any existing render task
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
          renderTaskRef.current = null;
        }

        const page = await pdf.getPage(pageNumber);
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');

        if (!canvas || !context) return;

        // Get viewport at user's desired scale
        const viewport = page.getViewport({ scale, rotation });

        // Dynamic resolution based on device and user preference
        const getOptimalResolution = () => {
          const devicePixelRatio = window.devicePixelRatio || 1;
          // Use 2x for standard displays, 1.5x for very high DPI to save memory
          return devicePixelRatio > 2 ? 1.5 : 2;
        };

        const resolution = getOptimalResolution();

        // Set canvas actual size (high resolution)
        canvas.width = resolution * viewport.width;
        canvas.height = resolution * viewport.height;

        // Set canvas display size (user's desired scale)
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        // Enable high-quality rendering
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          transform: [resolution, 0, 0, resolution, 0, 0] // Force higher resolution rendering
        };

        // Start new render task and store reference
        renderTaskRef.current = page.render(renderContext);

        try {
          await renderTaskRef.current.promise;
          // Clear the ref when render completes successfully
          renderTaskRef.current = null;
        } catch (renderError: any) {
          // Handle render cancellation gracefully
          if (renderError.name === 'RenderingCancelledException') {
            // This is expected when we cancel renders, don't show error
            return;
          }
          throw renderError; // Re-throw other errors
        }
      } catch (error: any) {
        console.error('Error rendering page:', error);
        // Only show error if it's not a cancellation
        if (error.name !== 'RenderingCancelledException') {
          setError('Failed to render PDF page.');
        }
      }
    };

    renderPage();

    // Cleanup function to cancel render task if dependencies change
    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
    };
  }, [pdf, pageNumber, scale, rotation, isClient]);

  // Navigation handlers
  const goToPreviousPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  const goToNextPage = () => {
    if (pageNumber < numPages) {
      setPageNumber(pageNumber + 1);
    }
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const rotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const resetView = () => {
    setScale(1.2); // Reset to default quality scale
    setRotation(0);
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    
    try {
      if (!isFullscreen) {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else if ((containerRef.current as any).webkitRequestFullscreen) {
          await (containerRef.current as any).webkitRequestFullscreen();
        } else if ((containerRef.current as any).msRequestFullscreen) {
          await (containerRef.current as any).msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
      }
    } catch (error) {
      console.error('Fullscreen toggle failed:', error);
    }
  };

  const retry = () => {
    setError(null);
    setPdf(null);
    setPageNumber(1);
    setNumPages(0);
    // This will trigger the useEffect to reload
  };

  // Fullscreen change event listener
  useEffect(() => {
    if (!isClient) return;

    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, [isClient]);

  // Keyboard navigation
  useEffect(() => {
    if (!isClient) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle if no input is focused
      if ((event.target as HTMLElement)?.tagName === 'INPUT') return;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          goToPreviousPage();
          break;
        case 'ArrowRight':
          event.preventDefault();
          goToNextPage();
          break;
        case '+':
        case '=':
          event.preventDefault();
          zoomIn();
          break;
        case '-':
          event.preventDefault();
          zoomOut();
          break;
        case 'r':
        case 'R':
          event.preventDefault();
          rotate();
          break;
        case '0':
          event.preventDefault();
          resetView();
          break;
        case 'f':
        case 'F':
          event.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pageNumber, numPages, isClient]);

  // Don't render on server side to avoid SSR issues
  if (!isClient) {
    return (
      <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800" style={{ height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto mb-2"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading PDF viewer...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800" style={{ height }}>
        <div className="text-center max-w-md">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading PDF...</p>
          {isGitHubRawUrl(url) && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Fetching...
            </p>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    const isGitHubUrl = isGitHubRawUrl(url);

    return (
      <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800" style={{ height }}>
        <div className="text-center p-4 max-w-lg">
          <div className="text-red-500 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-2">
            {isGitHubUrl ? 'GitHub File Issue' : 'PDF Load Error'}
          </h3>
          <p className="text-red-600 dark:text-red-400 mb-4 text-sm whitespace-pre-line">{error}</p>

          <div className="space-y-2">
            <div className="flex gap-2 justify-center">
              <Button onClick={retry} variant="outline" size="sm">
                Try Again
              </Button>
              {isGitHubUrl && (
                <Button
                  onClick={() => window.open(url, '_blank')}
                  variant="outline"
                  size="sm"
                >
                  Open Direct Link
                </Button>
              )}
            </div>

            {isGitHubUrl && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mt-4">
                <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">
                  GitHub File Processing Tips:
                </p>
                <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1 text-left">
                  <li>• Wait 2-3 minutes after uploading for files to become available</li>
                  <li>• Files with special characters may need re-uploading</li>
                  <li>• Try refreshing the page or re-selecting the PDF</li>
                  <li>• The proxy handles most connectivity issues automatically</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!pdf) {
    return (
      <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800" style={{ height }}>
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">No PDF loaded</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`flex flex-col h-full bg-white dark:bg-gray-900 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`} 
      style={isFullscreen ? { height: '100vh' } : { height }}
    >
      {/* PDF Controls */}
      <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <Button
            onClick={goToPreviousPage}
            disabled={pageNumber <= 1}
            size="sm"
            variant="outline"
            title="Previous page (←)"
          >
            ←
          </Button>
          <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[60px] text-center">
            {pageNumber} / {numPages}
          </span>
          <Button
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
            size="sm"
            variant="outline"
            title="Next page (→)"
          >
            →
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={zoomOut}
            size="sm"
            variant="outline"
            disabled={scale <= 0.5}
            title="Zoom out (-)"
          >
            -
          </Button>
          <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[50px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            onClick={zoomIn}
            size="sm"
            variant="outline"
            disabled={scale >= 3}
            title="Zoom in (+)"
          >
            +
          </Button>
          <Button
            onClick={rotate}
            size="sm"
            variant="outline"
            title="Rotate (R)"
          >
            ↻
          </Button>
          <Button
            onClick={resetView}
            size="sm"
            variant="outline"
            title="Reset view (0)"
          >
            Reset
          </Button>
          <Button
            onClick={toggleFullscreen}
            size="sm"
            variant="outline"
            title={isFullscreen ? "Exit fullscreen (F)" : "Enter fullscreen (F)"}
          >
            {isFullscreen ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
          </Button>
        </div>
      </div>

      {/* PDF Canvas */}
      <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-800 p-4">
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            className="shadow-lg border border-gray-300 dark:border-gray-600 select-none max-w-full"
            style={{
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none',
            }}
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
          />
        </div>
      </div>

      {/* Status bar */}
      <div className="px-2 py-1 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <p className="text-xs text-gray-500">
          Use ←/→ arrows to navigate, +/- to zoom, R to rotate, 0 to reset, F for fullscreen
        </p>
        {isGitHubRawUrl(url) && (
          <span className="text-xs text-blue-600 dark:text-blue-400">

          </span>
        )}
      </div>
    </div>
  );
};

export default PDFViewer;
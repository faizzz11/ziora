'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Shield, Eye, AlertTriangle, X } from 'lucide-react';

interface SecurityProtectionProps {
  children: React.ReactNode;
  strictMode?: boolean;
}

interface SecurityEvent {
  eventType: 'screenshot_attempt' | 'right_click' | 'dev_tools_open' | 'copy_attempt' | 'print_attempt';
  timestamp: string;
  page: string;
  userAgent: string;
  ip?: string;
  userId?: string;
  details: {
    platform: string;
    screenWidth: number;
    screenHeight: number;
    keysCombination?: string;
    [key: string]: any;
  };
}

interface ToastNotification {
  id: string;
  message: string;
  type: 'warning' | 'error' | 'info';
}

const SecurityProtection: React.FC<SecurityProtectionProps> = ({ children, strictMode = false }) => {
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);
  const [protectionBlur, setProtectionBlur] = useState(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const devToolsCheckRef = useRef<NodeJS.Timeout | null>(null);
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const toastTimeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Function to log security events
  const logSecurityEvent = async (eventType: SecurityEvent['eventType'], details: any = {}) => {
    try {
      const securityEvent: SecurityEvent = {
        eventType,
        timestamp: new Date().toISOString(),
        page: window.location.pathname,
        userAgent: navigator.userAgent,
        details: {
          platform: navigator.platform,
          screenWidth: window.screen.width,
          screenHeight: window.screen.height,
          ...details
        }
      };

      // Add user ID if available
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          securityEvent.userId = user.email || user._id;
        } catch (e) {
          // User data not available or invalid
        }
      }

      await fetch('/api/security/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(securityEvent),
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  };

  // Show toast notification
  const showToast = (message: string, type: ToastNotification['type'] = 'warning', duration: number = 4000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastNotification = { id, message, type };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove toast after duration
    const timeout = setTimeout(() => {
      removeToast(id);
    }, duration);
    
    toastTimeoutRefs.current.set(id, timeout);
  };

  // Remove toast notification
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
    const timeout = toastTimeoutRefs.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      toastTimeoutRefs.current.delete(id);
    }
  };

  // Show temporary protection blur effect for developer tools
  const showProtectionEffect = (duration: number = 3000) => {
    setProtectionBlur(true);
    
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    
    blurTimeoutRef.current = setTimeout(() => {
      setProtectionBlur(false);
    }, duration);
  };

  // Enhanced keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isWindows = navigator.platform.toUpperCase().indexOf('WIN') >= 0;
      const isLinux = navigator.platform.toUpperCase().indexOf('LINUX') >= 0;

      // Enhanced macOS detection - Block ANY command key usage for screenshot prevention
      if (isMac && e.metaKey) {
        // Specific screenshot combinations
        if (e.shiftKey && ['Digit3', 'Digit4', 'Digit5', 'Digit6'].includes(e.code)) {
          e.preventDefault();
          e.stopPropagation();
          
          const screenshotTypes: { [key: string]: string } = {
            'Digit3': 'fullscreen',
            'Digit4': 'selection', 
            'Digit5': 'options_menu',
            'Digit6': 'touchbar'
          };
          
          logSecurityEvent('screenshot_attempt', { 
            keysCombination: `cmd+shift+${e.code.slice(-1)}`,
            screenshotType: screenshotTypes[e.code],
            platform: 'macOS'
          });
          
          showToast('🚫 Screenshot blocked! This content is protected.', 'error', 5000);
          return false;
        }

        // General command key combinations that could be used for screenshots
        if (e.shiftKey) {
          e.preventDefault();
          e.stopPropagation();
          logSecurityEvent('screenshot_attempt', { 
            keysCombination: `cmd+shift+${e.code}`,
            screenshotType: 'potential_screenshot',
            platform: 'macOS'
          });
          showToast('⚠️ Command combinations disabled for content protection', 'warning', 3000);
          return false;
        }

        // Block common screenshot-related command combinations
        const blockedCommands = ['KeyS', 'KeyP', 'KeyC', 'KeyA', 'KeyX', 'KeyV'];
        if (blockedCommands.includes(e.code)) {
          e.preventDefault();
          e.stopPropagation();
          
          const actionNames: { [key: string]: string } = {
            'KeyS': 'save/screenshot',
            'KeyP': 'print', 
            'KeyC': 'copy',
            'KeyA': 'select all',
            'KeyX': 'cut',
            'KeyV': 'paste'
          };
          
          logSecurityEvent('copy_attempt', { 
            keysCombination: `cmd+${e.code.slice(3).toLowerCase()}`,
            action: actionNames[e.code],
            platform: 'macOS'
          });
          
          showToast(`⚠️ ${actionNames[e.code]} disabled for content protection`, 'warning', 3000);
          return false;
        }
      }

      // Windows/Linux screenshot combinations
      if (isWindows || isLinux) {
        // PrintScreen key
        if (e.code === 'PrintScreen') {
          e.preventDefault();
          e.stopPropagation();
          logSecurityEvent('screenshot_attempt', { 
            keysCombination: 'PrintScreen',
            screenshotType: 'printscreen',
            platform: isWindows ? 'Windows' : 'Linux'
          });
          showToast('🚫 Screenshot blocked! This content is protected.', 'error', 5000);
          return false;
        }

        // Alt + PrintScreen (Active window)
        if (e.altKey && e.code === 'PrintScreen') {
          e.preventDefault();
          e.stopPropagation();
          logSecurityEvent('screenshot_attempt', { 
            keysCombination: 'alt+printscreen',
            screenshotType: 'active_window',
            platform: isWindows ? 'Windows' : 'Linux'
          });
          showToast('🚫 Window screenshot blocked!', 'error', 4000);
          return false;
        }

        // Windows + Shift + S (Windows Snipping Tool)
        if (isWindows && e.metaKey && e.shiftKey && e.code === 'KeyS') {
          e.preventDefault();
          e.stopPropagation();
          logSecurityEvent('screenshot_attempt', { 
            keysCombination: 'win+shift+s',
            screenshotType: 'snipping_tool',
            platform: 'Windows'
          });
          showToast('🚫 Snipping tool blocked!', 'error', 4000);
          return false;
        }

        // Ctrl + Shift + S (Browser/app specific)
        if (e.ctrlKey && e.shiftKey && e.code === 'KeyS') {
          e.preventDefault();
          e.stopPropagation();
          logSecurityEvent('screenshot_attempt', { 
            keysCombination: 'ctrl+shift+s',
            screenshotType: 'browser_screenshot',
            platform: isWindows ? 'Windows' : 'Linux'
          });
          showToast('🚫 Browser screenshot blocked!', 'error', 4000);
          return false;
        }
      }

      // Cross-platform developer tools detection
      const devToolsCombinations = [
        { key: 'F12', condition: e.code === 'F12' },
        { key: 'ctrl+shift+i', condition: e.ctrlKey && e.shiftKey && e.code === 'KeyI' && !isMac },
        { key: 'cmd+option+i', condition: e.metaKey && e.altKey && e.code === 'KeyI' && isMac },
        { key: 'ctrl+shift+j', condition: e.ctrlKey && e.shiftKey && e.code === 'KeyJ' && !isMac },
        { key: 'cmd+option+j', condition: e.metaKey && e.altKey && e.code === 'KeyJ' && isMac },
        { key: 'ctrl+shift+c', condition: e.ctrlKey && e.shiftKey && e.code === 'KeyC' && !isMac },
        { key: 'cmd+option+c', condition: e.metaKey && e.altKey && e.code === 'KeyC' && isMac },
        { key: 'ctrl+u', condition: e.ctrlKey && e.code === 'KeyU' && !isMac },
        { key: 'cmd+u', condition: e.metaKey && e.code === 'KeyU' && isMac },
      ];

      for (const combo of devToolsCombinations) {
        if (combo.condition) {
          e.preventDefault();
          e.stopPropagation();
          logSecurityEvent('dev_tools_open', { 
            keysCombination: combo.key,
            platform: isMac ? 'macOS' : (isWindows ? 'Windows' : 'Linux')
          });
          showToast('🔒 Developer tools access blocked!', 'error', 3000);
          return false;
        }
      }

      // Enhanced copy/paste/save prevention in strict mode
      if (strictMode) {
        const blockCombinations = [
          { key: 'ctrl+c', condition: e.ctrlKey && e.code === 'KeyC' && !isMac },
          { key: 'ctrl+v', condition: e.ctrlKey && e.code === 'KeyV' && !isMac },
          { key: 'ctrl+a', condition: e.ctrlKey && e.code === 'KeyA' && !isMac },
          { key: 'ctrl+x', condition: e.ctrlKey && e.code === 'KeyX' && !isMac },
          { key: 'ctrl+s', condition: e.ctrlKey && e.code === 'KeyS' && !isMac },
          { key: 'ctrl+p', condition: e.ctrlKey && e.code === 'KeyP' && !isMac },
        ];

        for (const combo of blockCombinations) {
          if (combo.condition) {
            e.preventDefault();
            e.stopPropagation();
            const eventType = combo.key.includes('c') ? 'copy_attempt' : 
                             combo.key.includes('p') ? 'print_attempt' : 'copy_attempt';
            logSecurityEvent(eventType, { 
              keysCombination: combo.key,
              platform: isWindows ? 'Windows' : 'Linux'
            });
            showToast(`⚠️ ${combo.key} disabled for protection`, 'warning', 2000);
            return false;
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [strictMode]);

  // Right-click protection with toast
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      logSecurityEvent('right_click');
      showToast('🚫 Right-click disabled for content protection', 'warning', 2000);
      return false;
    };

    document.addEventListener('contextmenu', handleContextMenu, true);
    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu, true);
    };
  }, []);

  // Enhanced developer tools detection
  useEffect(() => {
    let devtools = { open: false };

    const detectDevTools = () => {
      const threshold = 160;
      
      // Multiple detection methods
      const heightDiff = window.outerHeight - window.innerHeight > threshold;
      const widthDiff = window.outerWidth - window.innerWidth > threshold;
      
      // Simplified detection method
      const isOpen = heightDiff || widthDiff;
      
      if (isOpen && !devtools.open) {
        devtools.open = true;
        setIsDevToolsOpen(true);
        logSecurityEvent('dev_tools_open', { 
          detectionMethod: 'window_size_monitor',
          heightDiff,
          widthDiff,
          outerHeight: window.outerHeight,
          innerHeight: window.innerHeight,
          outerWidth: window.outerWidth,
          innerWidth: window.innerWidth
        });
        showProtectionEffect(5000);
        showToast('🔒 Developer tools detected! Content protected.', 'error', 8000);
      } else if (!isOpen && devtools.open) {
        devtools.open = false;
        setIsDevToolsOpen(false);
      }
    };

    // Check immediately and then every 1 second
    detectDevTools();
    devToolsCheckRef.current = setInterval(detectDevTools, 1000);

    return () => {
      if (devToolsCheckRef.current) {
        clearInterval(devToolsCheckRef.current);
      }
    };
  }, []);

  // Text selection prevention in strict mode
  useEffect(() => {
    if (!strictMode) return;

    const preventSelection = (e: Event) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener('selectstart', preventSelection);
    document.addEventListener('dragstart', preventSelection);
    
    return () => {
      document.removeEventListener('selectstart', preventSelection);
      document.removeEventListener('dragstart', preventSelection);
    };
  }, [strictMode]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
      if (devToolsCheckRef.current) {
        clearInterval(devToolsCheckRef.current);
      }
      // Clear all toast timeouts
      toastTimeoutRefs.current.forEach(timeout => clearTimeout(timeout));
      toastTimeoutRefs.current.clear();
    };
  }, []);

  // Enhanced protection styles
  const protectionStyles = strictMode ? {
    userSelect: 'none' as const,
    WebkitUserSelect: 'none' as const,
    MozUserSelect: 'none' as const,
    msUserSelect: 'none' as const,
    WebkitTouchCallout: 'none' as const,
    WebkitUserDrag: 'none' as const,
    pointerEvents: 'auto' as const,
  } : {};

  return (
    <div style={protectionStyles} className="relative">
      {/* Toast Notifications Container */}
      <div className="fixed top-4 left-4 z-[10000] space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              flex items-center justify-between max-w-sm p-4 rounded-lg shadow-lg border
              pointer-events-auto transform transition-all duration-300 ease-in-out
              animate-in slide-in-from-left-4 fade-in
              ${toast.type === 'error' 
                ? 'bg-red-50 dark:bg-red-900/90 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200' 
                : toast.type === 'warning'
                ? 'bg-yellow-50 dark:bg-yellow-900/90 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200'
                : 'bg-blue-50 dark:bg-blue-900/90 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
              }
            `}
          >
            <div className="flex items-center space-x-2">
              <AlertTriangle size={16} className="flex-shrink-0" />
              <span className="text-sm font-medium">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Developer Tools Warning Overlay */}
      {isDevToolsOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-2xl border-2 border-red-500 max-w-md mx-4 animate-pulse">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="text-red-500" size={32} />
              <div>
                <h3 className="text-lg font-bold text-red-600 dark:text-red-400">Security Alert</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Content Protection Active</p>
              </div>
            </div>
            <p className="text-gray-800 dark:text-gray-200 mb-4">
              Developer tools detected. Please close them to continue accessing the content.
            </p>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              This content is protected against unauthorized access and copying.
            </div>
          </div>
        </div>
      )}

      {/* Content Protection Watermark */}
      <div className="fixed bottom-4 right-4 z-50 opacity-30 pointer-events-none">
        <div className="bg-black/20 dark:bg-white/20 px-3 py-1 rounded-lg backdrop-blur-sm">
          <div className="flex items-center space-x-2 text-xs">
            <Shield size={12} />
            <span className="text-gray-800 dark:text-gray-200">Content Protected</span>
          </div>
        </div>
      </div>

      {/* Protection Status Indicator */}
      <div className="fixed top-4 right-4 z-40 pointer-events-none">
        <div className={`flex items-center space-x-2 px-3 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
          isDevToolsOpen 
            ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' 
            : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
        }`}>
          <div className={`w-2 h-2 rounded-full ${isDevToolsOpen ? 'bg-red-500' : 'bg-green-500'}`} />
          <Eye size={12} />
          <span>{isDevToolsOpen ? 'Security Alert' : 'Protected'}</span>
        </div>
      </div>

      {/* Enhanced Content Wrapper with Blur Effect */}
      <div className={`transition-all duration-300 ${
        protectionBlur ? 'filter blur-sm' : ''
      } ${isDevToolsOpen ? 'filter blur-lg' : ''}`}>
        {children}
      </div>
    </div>
  );
};

export default SecurityProtection; 
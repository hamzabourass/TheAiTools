"use client"

import { createContext, useContext, useState } from 'react';
import { Loader2, X } from 'lucide-react';

interface NotificationContextType {
  showGenerating: boolean;
  showSuccess: boolean;
  setGeneratingNotification: (show: boolean) => void;
  setSuccess: (show: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [showGenerating, setGeneratingNotification] = useState(false);
  const [showSuccess, setSuccess] = useState(false);

  return (
    <NotificationContext.Provider 
      value={{ 
        showGenerating, 
        showSuccess, 
        setGeneratingNotification, 
        setSuccess 
      }}
    >
      {showGenerating && (
        <div className="fixed inset-x-0 top-0 z-50">
          <div className="relative bg-primary border-b">
            <div className="w-full mx-auto p-4 flex items-center justify-center text-primary-foreground">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm font-medium">
                  Generating your PDF... Feel free to navigate away, we&apos;ll let you know when it&apos;s ready.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSuccess && !showGenerating && (
        <div className="fixed inset-x-0 top-0 z-50">
          <div className="relative bg-green-600 border-b">
            <div className="w-full mx-auto p-4 flex items-center justify-between text-white">
              <div className="flex-1 flex justify-center">
                <span className="text-sm font-medium">PDF generated successfully!</span>
              </div>
              <button 
                onClick={() => setSuccess(false)}
                className="p-1.5 hover:bg-green-700 rounded-full transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {(showGenerating || showSuccess) && <div className="h-12" />}
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
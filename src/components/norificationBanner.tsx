"use client"
import { Loader2, X } from 'lucide-react';
import { useEffect } from 'react';
import { useNotifications } from './providers/notificationProvider';

export function NotificationBanners() {
  const { showGenerating, showSuccess, setSuccess } = useNotifications();

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess, setSuccess]);

  if (!showGenerating && !showSuccess) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-50">
      {/* Semi-transparent overlay for the entire viewport */}
      <div className="absolute inset-0 bg-black/5 backdrop-blur-[2px]" />
      
      {/* Generating Banner */}
      {showGenerating && (
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
      )}

      {/* Success Banner */}
      {showSuccess && !showGenerating && (
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
      )}
    </div>
  );
}
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { motion } from 'framer-motion';

interface QRScannerProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
  onClose: () => void;
}

// Global flag to prevent multiple scanner instances across all components
let globalScannerActive = false;

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onError, onClose }) => {
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scanAreaRef = useRef<HTMLDivElement>(null);
  const isStartingRef = useRef<boolean>(false);
  const isMountedRef = useRef<boolean>(false);
  const scannerIdRef = useRef<string>(`qr-scanner-${Date.now()}-${Math.random()}`);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        // Scanner might already be stopped, ignore error
        console.debug('Scanner stop error (may be already stopped):', err);
      }
      try {
        scannerRef.current.clear();
      } catch (err) {
        console.debug('Scanner clear error:', err);
      }
      scannerRef.current = null;
    }
    
    // Clean up any leftover video elements in the scanner container
    const scannerElement = document.getElementById(scannerIdRef.current);
    if (scannerElement) {
      const videos = scannerElement.querySelectorAll('video');
      videos.forEach(video => {
        if (video.srcObject) {
          const tracks = (video.srcObject as MediaStream).getTracks();
          tracks.forEach(track => track.stop());
        }
        video.remove();
      });
      // Clear any canvas elements too
      const canvases = scannerElement.querySelectorAll('canvas');
      canvases.forEach(canvas => canvas.remove());
      // Clear inner HTML to remove any other elements
      scannerElement.innerHTML = '';
    }
    
    isStartingRef.current = false;
    globalScannerActive = false;
  }, []);

  const handleClose = useCallback(async () => {
    await stopScanner();
    onClose();
  }, [stopScanner, onClose]);

  const startScanning = useCallback(async () => {
    // Prevent multiple instances from starting (both local and global)
    if (isStartingRef.current || scannerRef.current || globalScannerActive) {
      console.debug('Scanner already active, skipping...');
      return;
    }

    // Check if component is still mounted
    if (!isMountedRef.current) {
      return;
    }

    isStartingRef.current = true;
    globalScannerActive = true;

    try {
      setError(null);
      setIsRetrying(false);
      
      // Ensure any existing scanner is stopped first
      await stopScanner();
      
      // Minimal delay for cleanup
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Verify element exists
      const scannerElement = document.getElementById(scannerIdRef.current);
      if (!scannerElement) {
        throw new Error('Scanner element not found');
      }
      
      // Double-check no video streams are active
      const existingVideos = scannerElement.querySelectorAll('video');
      if (existingVideos.length > 0) {
        existingVideos.forEach(video => {
          if (video.srcObject) {
            const tracks = (video.srcObject as MediaStream).getTracks();
            tracks.forEach(track => track.stop());
          }
          video.remove();
        });
      }
      
      // Request permission explicitly so we can show clearer errors
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('Camera API not supported in this browser. Please use a modern browser like Chrome, Firefox, or Safari.');
      }

      let stream: MediaStream | null = null;
      try {
        // Optimize camera settings for faster scanning
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment'
          } 
        });
      } catch (permErr: any) {
        // Handle specific permission errors
        if (permErr.name === 'NotAllowedError') {
          throw new Error('PERMISSION_DENIED');
        } else if (permErr.name === 'NotFoundError') {
          throw new Error('Camera not found. Please ensure your device has a camera.');
        } else if (permErr.name === 'NotReadableError') {
          throw new Error('Camera is already in use by another application. Please close other apps using the camera.');
        }
        throw permErr;
      }

      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }

      // Use unique ID for scanner element
      const scannerId = scannerIdRef.current;
      const scanner = new Html5Qrcode(scannerId);
      scannerRef.current = scanner;

      await scanner.start(
        { 
          facingMode: 'environment'
        },
        {
          fps: 60, // Maximum frame rate for fastest detection
          qrbox: { width: 250, height: 250 }, // Optimal size for speed vs accuracy
          aspectRatio: 1.0,
          disableFlip: false, // Allow flipping for better detection
          videoConstraints: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'environment',
          },
        },
        (decodedText, decodedResult) => {
          console.log('✅ QR Code detected:', decodedText);
          console.log('Decoded result:', decodedResult);
          
          setIsScanning(true);
          
          // Call the onScan callback with the decoded text
          if (onScan && typeof onScan === 'function') {
            try {
              // Call the callback immediately
              onScan(decodedText);
              // Close scanner immediately for faster response
              setIsScanning(false);
              stopScanner().then(() => onClose());
            } catch (err) {
              console.error('❌ Error in onScan callback:', err);
              setIsScanning(false);
              setError(`Error processing QR code: ${err instanceof Error ? err.message : 'Unknown error'}`);
              // Don't close on error, let user try again
            }
          } else {
            console.error('❌ onScan callback is not a function:', onScan);
            setIsScanning(false);
            stopScanner().then(() => onClose());
          }
        },
        (errorMessage) => {
          // Ignore not found errors (they're expected while scanning)
          if (errorMessage && !errorMessage.includes('NotFoundException')) {
            // Only log errors that aren't "not found" errors
            if (!errorMessage.includes('No QR code found')) {
              console.debug('Scan error:', errorMessage);
            }
          }
        }
      );
      
      // Scanner started successfully, reset the starting flag
      isStartingRef.current = false;
      setIsScanning(true);
      console.log('✅ QR Scanner started successfully');
    } catch (err: any) {
      console.error('Failed to start QR scanner:', err);
      isStartingRef.current = false;
      let msg = 'Failed to start camera';
      
      if (err.message === 'PERMISSION_DENIED') {
        msg = 'Camera permission denied. Please allow camera access and try again.';
      } else if (err instanceof Error) {
        msg = err.message;
      }
      
      setError(msg);
      if (onError) {
        onError(msg);
      }
    }
  }, [onScan, onError, stopScanner, onClose]);

  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    await stopScanner();
    // Minimal delay for faster retry
    setTimeout(() => {
      startScanning();
    }, 50);
  }, [stopScanner, startScanning]);

  useEffect(() => {
    // Mark component as mounted
    isMountedRef.current = true;
    
    // Minimal delay to ensure DOM is ready and avoid Strict Mode double mount
    const timer = setTimeout(() => {
      if (isMountedRef.current && !isStartingRef.current && !scannerRef.current && !globalScannerActive) {
        startScanning();
      }
    }, 50);

    return () => {
      isMountedRef.current = false;
      clearTimeout(timer);
      // Cleanup on unmount
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run once on mount

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[rgba(15,23,36,0.6)] z-50 flex items-center justify-center p-4"
    >
      <div className="relative w-full max-w-md">
        {error ? (
          <div className="border border-gray-200 p-6 bg-white text-gray-900 rounded-xl shadow-soft">
            <h3 className="text-xl font-bold mb-4">Camera Permission Required</h3>
            <p className="mb-4">{error}</p>
            {error.includes('permission') && (
              <div className="mb-4 p-3 bg-gray-50 border border-gray-100 rounded text-sm">
                <p className="font-bold mb-2">How to allow camera access:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Click the camera icon in your browser's address bar</li>
                  <li>Or go to browser Settings → Privacy → Camera</li>
                  <li>Allow access for this site, then click Retry</li>
                </ul>
              </div>
            )}
            <div className="flex gap-3">
              {error.includes('permission') && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="flex-1 px-6 py-3 bg-primary-500 text-white font-bold hover:bg-primary-600 transition-colors disabled:opacity-50"
                >
                  {isRetrying ? 'Retrying...' : 'Retry'}
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClose}
                className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 hover:bg-white hover:text-gray-900 transition-colors"
              >
                Close
              </motion.button>
            </div>
          </div>
        ) : (
          <>
            <div className="relative">
              <div id={scannerIdRef.current} ref={scanAreaRef} className="w-full border border-gray-200 rounded-lg bg-white min-h-[50vh] sm:min-h-[400px]" />
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="border border-dashed border-gray-300 rounded-lg" style={{ width: '250px', height: '250px' }} title="QR Code scanning area">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-gray-300"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-gray-300"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-gray-300"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-gray-300"></div>
                </div>
              </div>
            </div>
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClose}
              className="absolute top-4 right-4 w-12 h-12 bg-white text-gray-900 rounded-full flex items-center justify-center text-xl font-bold hover:bg-gray-50 transition-colors z-10"
            >
              ×
            </motion.button>
            <div className="mt-4 text-center text-gray-700">
              {isScanning ? (
                <>
                  <p className="text-sm mb-2 font-bold text-green-500">Scanning... Keep QR code steady</p>
                  <p className="text-xs text-gray-500">Point camera at the QR code</p>
                </>
              ) : (
                <>
                  <p className="text-sm mb-2">Position the QR code within the frame</p>
                  <p className="text-xs text-gray-500">Make sure the QR code is well-lit and fully visible</p>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default QRScanner;


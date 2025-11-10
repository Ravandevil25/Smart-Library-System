import React from 'react';
import type { PropsWithChildren } from 'react';

/**
 * PdfImageScanner
 * Props:
 *  - file: File (pdf or image)
 *  - onDecoded: (text: string) => void
 *  - onError?: (err: string) => void
 *
 * Behaviour:
 *  - For a PDF: render first page to a canvas (pdfjs-dist) and convert to Blob
 *  - For an image: pass the File directly
 *  - Use html5-qrcode scanFile to decode and call onDecoded
 *
 * Note: dynamic imports are used to keep initial bundle small.
 */
interface PdfImageScannerProps {
  file: File;
  onDecoded: (text: string) => void;
  onError?: (msg: string) => void;
}

const PdfImageScanner: React.FC<PropsWithChildren<PdfImageScannerProps>> = ({ file, onDecoded, onError }) => {
  React.useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const [{ Html5Qrcode }, pdfjs] = await Promise.all([
          import('html5-qrcode'),
          // pdfjs doesn't expose types in this path for our TS config; ignore the check for the dynamic import
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          import('pdfjs-dist/legacy/build/pdf'),
        ] as any);

        const decodeImageFile = async (imageFile: File) => {
          // create hidden container for Html5Qrcode
          const tempId = `file-scan-temp-${Date.now()}`;
          const tempEl = document.createElement('div');
          tempEl.style.position = 'absolute';
          tempEl.style.width = '1px';
          tempEl.style.height = '1px';
          tempEl.style.overflow = 'hidden';
          tempEl.style.left = '-9999px';
          tempEl.id = tempId;
          document.body.appendChild(tempEl);

          const scanner = new Html5Qrcode(tempId);
          try {
            const decodedText = await scanner.scanFile(imageFile, /* showImage= */ false);
            if (decodedText && !cancelled) {
              onDecoded(decodedText);
            } else if (!cancelled) {
              onError?.('No QR/barcode found in the uploaded file.');
            }
          } catch (err) {
            console.error('File scan failed', err);
            if (!cancelled) onError?.('Failed to decode the uploaded file. Make sure the QR/barcode is clear.');
          } finally {
            try { await scanner.clear(); } catch(_) {}
            const el = document.getElementById(tempId);
            if (el) el.remove();
          }
        };

        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
          const arrayBuffer = await file.arrayBuffer();
          // disable worker for simpler bundling; you can set workerSrc if you want worker
          const loadingTask = pdfjs.getDocument({ data: arrayBuffer, disableWorker: true });
          const pdf = await loadingTask.promise;
          const page = await pdf.getPage(1);
          const viewport = page.getViewport({ scale: 2 });
          const canvas = document.createElement('canvas');
          canvas.width = Math.ceil(viewport.width);
          canvas.height = Math.ceil(viewport.height);
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Failed to get canvas context');
          await page.render({ canvasContext: ctx, viewport }).promise;
          const blob: Blob | null = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
          if (!blob) throw new Error('Failed to create image from PDF');
          const imageFile = new File([blob], 'page-1.png', { type: 'image/png' });
          await decodeImageFile(imageFile);
        } else if (file.type.startsWith('image/') || /\.(png|jpe?g|webp|bmp)$/i.test(file.name)) {
          await decodeImageFile(file);
        } else {
          onError?.('Unsupported file type. Please upload a PDF or an image containing the QR code.');
        }
      } catch (err) {
        console.error('Error scanning file', err);
        onError?.('Error processing file. See console for details.');
      }
    }

    run();

    return () => { cancelled = true; };
  }, [file, onDecoded, onError]);

  return null;
};

export default PdfImageScanner;
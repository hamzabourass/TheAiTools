'use client';

import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set the worker source to the correct CDN URL
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

export function PDFViewer({ url }: { url: string }) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageWidth, setPageWidth] = useState<number>(800); // Default width

  // Function to update the page width based on screen size
  const updatePageWidth = () => {
    if (window.innerWidth < 600) {
      setPageWidth(window.innerWidth * 0.9); // 90% of screen width for mobile
    } else if (window.innerWidth < 900) {
      setPageWidth(window.innerWidth * 0.8); // 80% of screen width for tablets
    } else {
      setPageWidth(800); // Fixed width for desktops
    }
  };

  // Update page width on mount and window resize
  useEffect(() => {
    updatePageWidth(); // Set initial width
    window.addEventListener('resize', updatePageWidth); // Update width on resize

    return () => {
      window.removeEventListener('resize', updatePageWidth); // Cleanup
    };
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  return (
    <div style={{ height: '100%', width: '100%', overflow: 'auto' }}>
      <Document file={url} onLoadSuccess={onDocumentLoadSuccess}>
        <Page pageNumber={pageNumber} width={pageWidth} /> {/* Dynamic width */}
      </Document>
    </div>
  );
}
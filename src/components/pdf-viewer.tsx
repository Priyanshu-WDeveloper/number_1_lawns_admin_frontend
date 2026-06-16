import { useEffect, useRef, useState } from 'react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';

GlobalWorkerOptions.workerSrc = workerUrl;

interface PDFViewerProps {
  file: Blob | ArrayBuffer | Uint8Array;
}

export function PDFViewer({ file }: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPDF() {
      setLoading(true);
      setError(null);
      setPdfDoc(null);
      try {
        const data = file instanceof Blob ? await file.arrayBuffer() : file;
        const pdf = await getDocument({ data: new Uint8Array((data as ArrayBuffer).slice()) }).promise;
        if (cancelled) {
          pdf.cleanup();
          return;
        }
        setNumPages(pdf.numPages);
        setPageNumber(1);
        setPdfDoc(pdf);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load PDF');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPDF();

    return () => {
      cancelled = true;
    };
  }, [file]);

  useEffect(() => {
    if (!canvasRef.current || !pdfDoc) return;

    let cancelled = false;

    async function renderPage() {
      try {
        const page = await pdfDoc.getPage(pageNumber);
        if (cancelled) return;

        const canvas = canvasRef.current!;
        const container = containerRef.current;
        const containerWidth = container ? container.clientWidth - 2 : canvas.width;
        const dpr = window.devicePixelRatio || 1;

        const unscaledViewport = page.getViewport({ scale: 1 });
        const scale = containerWidth / unscaledViewport.width;
        const viewport = page.getViewport({ scale });

        canvas.width = viewport.width * dpr;
        canvas.height = viewport.height * dpr;
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        const ctx = canvas.getContext('2d')!;
        ctx.scale(dpr, dpr);
        await page.render({ canvasContext: ctx, canvas, viewport }).promise;
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to render page');
        }
      }
    }

    renderPage();
  }, [pageNumber, pdfDoc]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-sm">
        <AlertCircle className="h-5 w-5 text-red-400" />
        <span className="text-red-500">{error}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      {numPages > 1 && (
        <div className="flex items-center gap-2 mb-2">
          <button
            type="button"
            onClick={() => setPageNumber(p => Math.max(1, p - 1))}
            disabled={pageNumber <= 1}
            className="flex items-center justify-center h-7 w-7 rounded-md border border-[#e5e7eb] bg-white text-[#6b7280] hover:bg-[#f3f4f6] disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <span className="text-xs text-[#6b7280] min-w-[60px] text-center">
            Page {pageNumber} of {numPages}
          </span>
          <button
            type="button"
            onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}
            disabled={pageNumber >= numPages}
            className="flex items-center justify-center h-7 w-7 rounded-md border border-[#e5e7eb] bg-white text-[#6b7280] hover:bg-[#f3f4f6] disabled:opacity-40 transition-colors"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      <div ref={containerRef} className="w-full overflow-auto flex justify-center">
        {loading && (
          <div className="flex items-center justify-center h-full gap-2 text-sm text-[#6b7280]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading document...
          </div>
        )}
        <canvas
          ref={canvasRef}
          className={loading ? 'hidden' : 'shadow-sm border border-[#e5e7eb]'}
        />
      </div>
    </div>
  );
}

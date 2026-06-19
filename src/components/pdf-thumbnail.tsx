import { useEffect, useState } from 'react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { FileText } from 'lucide-react';
import { resolveFileUrl } from '@/lib/media';

GlobalWorkerOptions.workerSrc = workerUrl;

const thumbnailCache = new Map<string, string>();
const MAX_CACHE_SIZE = 50;

interface PdfThumbnailProps {
  fileUrl: string;
  className?: string;
}

export function PdfThumbnail({ fileUrl, className }: PdfThumbnailProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!fileUrl) {
      setError(true);
      return;
    }

    let cancelled = false;

    const cached = thumbnailCache.get(fileUrl);
    if (cached) {
      setDataUrl(cached);
      return;
    }

    async function load() {
      try {
        const res = await fetch(resolveFileUrl(fileUrl));
        if (!res.ok) throw new Error('Failed to fetch PDF');
        const buffer = await res.arrayBuffer();

        const pdf = await getDocument({ data: new Uint8Array(buffer.slice()) }).promise;
        if (cancelled) { pdf.cleanup(); return; }

        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1 });
        const scale = Math.max(1, 400 / viewport.width);
        const scaled = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        canvas.width = scaled.width;
        canvas.height = scaled.height;
        const ctx = canvas.getContext('2d')!;
        await page.render({ canvasContext: ctx, canvas, viewport: scaled }).promise;
        pdf.cleanup();

        const url = canvas.toDataURL('image/png');

        if (thumbnailCache.size >= MAX_CACHE_SIZE) {
          const firstKey = thumbnailCache.keys().next().value;
          if (firstKey) thumbnailCache.delete(firstKey);
        }
        thumbnailCache.set(fileUrl, url);

        if (!cancelled) setDataUrl(url);
      } catch {
        if (!cancelled) setError(true);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [fileUrl]);

  if (error || !dataUrl) {
    return (
      <div className={`flex items-center justify-center bg-red-50 ${className || 'size-full rounded-[20px]'}`}>
        <FileText className="h-8 w-8 text-red-500" />
      </div>
    );
  }

  return <img src={dataUrl} alt="" className={className || 'size-full object-cover'} />;
}

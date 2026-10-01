"use client";

/** Rasterize PDF page 1 to JPEG for on-device OCR (local-first letter path). */
export async function pdfFirstPageToJpeg(file: File, maxEdge = 2000): Promise<Blob | null> {
  const data = new Uint8Array(await file.arrayBuffer());
  const pdfjs = await import("pdfjs-dist");
  // Use the worker shipped with the package (bundler-friendly URL).
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();

  const doc = await pdfjs.getDocument({ data }).promise;
  const page = await doc.getPage(1);
  const base = page.getViewport({ scale: 1 });
  const scale = Math.min(2, maxEdge / Math.max(base.width, base.height));
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(viewport.width);
  canvas.height = Math.round(viewport.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  await page.render({ canvasContext: ctx, viewport, canvas }).promise;
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/jpeg", 0.88));
}

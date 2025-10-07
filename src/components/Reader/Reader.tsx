import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

type BinaryOptions = {
  threshold: number; // 0..255
  invert: boolean;   // if true: white=1, black=0
};

function toBinaryCode(imageData: ImageData, opts: BinaryOptions): string {
  const { data, width, height } = imageData;
  const { threshold, invert } = opts;

  let lines: string[] = [];
  let i = 0;

  for (let y = 0; y < height; y++) {
    let line = "";
    for (let x = 0; x < width; x++) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // const a = data[i + 3]; // available if needed

      // perceived luminance (sRGB)
      const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const isBlack = luminance < threshold;
      const bit = invert ? (isBlack ? "0" : "1") : (isBlack ? "1" : "0");
      line += bit;

      i += 4;
    }
    lines.push(line);
  }
  return lines.join("\n");
}

async function loadIntoCanvas(
  file: File,
  canvas: HTMLCanvasElement,
  downscaleMaxWidth?: number
): Promise<void> {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("2D canvas context unavailable");

  // Prefer createImageBitmap to honor EXIF orientation and decode off-main-thread
  let bmp: ImageBitmap | null = null;

  if ("createImageBitmap" in window) {
    try {
      bmp = await createImageBitmap(file, { imageOrientation: "from-image" as ImageOrientation });
    } catch {
      bmp = null;
    }
  }

  if (bmp) {
    const scale =
      downscaleMaxWidth ? Math.min(1, downscaleMaxWidth / bmp.width) : 1;
    const w = Math.max(1, Math.round(bmp.width * scale));
    const h = Math.max(1, Math.round(bmp.height * scale));

    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(bmp, 0, 0, w, h);
    bmp.close();
    return;
  }

  // Fallback: HTMLImageElement
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.decoding = "async";
  img.src = url;
  await img.decode();

  const scale =
    downscaleMaxWidth ? Math.min(1, downscaleMaxWidth / img.naturalWidth) : 1;
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));

  canvas.width = w;
  canvas.height = h;
  ctx.drawImage(img, 0, 0, w, h);

  URL.revokeObjectURL(url);
}

const Reader: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [binaryCode, setBinaryCode] = useState<string>("");
  const [threshold, setThreshold] = useState<number>(128);
  const [invert, setInvert] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);

  // revoke preview object URLs on unmount or change
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const processCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = toBinaryCode(imageData, { threshold, invert });
    setBinaryCode(code);
  }, [threshold, invert]);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !file.type.startsWith("image/")) return;

      setProcessing(true);
      try {
        const canvas = canvasRef.current;
        if (!canvas) return;

        await loadIntoCanvas(file, canvas, /* downscaleMaxWidth */ 1024);

        // Create a preview image from the canvas (so it matches any downscale/orientation)
        canvas.toBlob(
          (blob) => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            setPreviewUrl((prev) => {
              if (prev) URL.revokeObjectURL(prev);
              return url;
            });
          },
          "image/png",
          0.92
        );

        // Build binary code immediately
        processCanvas();
      } finally {
        setProcessing(false);
      }
    },
    [processCanvas]
  );

  const downloadHref = useMemo(() => {
    const blob = new Blob([binaryCode], { type: "text/plain;charset=utf-8" });
    return URL.createObjectURL(blob);
  }, [binaryCode]);

  const columns = useMemo(
    () => (binaryCode ? binaryCode.split("\n")[0]?.length ?? 0 : 0),
    [binaryCode]
  );
  const rows = useMemo(
    () => (binaryCode ? binaryCode.split("\n").length : 0),
    [binaryCode]
  );

  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 900 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          Threshold: <strong>{threshold}</strong>
          <input
            type="range"
            min={0}
            max={255}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.currentTarget.value))}
          />
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={invert}
            onChange={(e) => setInvert(e.currentTarget.checked)}
          />
          Invert (white=1, black=0)
        </label>
        <button onClick={processCanvas} disabled={processing || !previewUrl}>
          Rebuild Code
        </button>
        {binaryCode && (
          <a href={downloadHref} download="image_binary.txt">
            Download .txt
          </a>
        )}
      </div>

      {processing && <div>Processing…</div>}

      {previewUrl && (
        <div>
          <p style={{ margin: 0 }}>Preview (processed size):</p>
          <img
            src={previewUrl}
            alt="preview"
            style={{ maxWidth: "100%", border: "1px solid #ddd" }}
          />
        </div>
      )}

      {/* Hidden canvas used for pixel access */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <div style={{ display: "grid", gap: 6 }}>
        <p style={{ margin: 0 }}>
          Binary code (rows top→bottom, cols left→right):{" "}
          <em>
            {columns} columns × {rows} rows
          </em>
        </p>
        <textarea
          value={binaryCode}
          readOnly
          spellCheck={false}
          style={{
            width: "100%",
            minHeight: 240,
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
            whiteSpace: "pre",
            overflow: "auto",
          }}
        />
      </div>
    </div>
  );
};

export default Reader;

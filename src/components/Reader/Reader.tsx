import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

type BinaryOptions = {
  threshold: number; // 0..255
  invert: boolean;   // if true: white=1, black=0
};

type DecodeMode = "mono" | "wcmYKRGB";

const PALETTE = {
  White:  "#ffffff",
  Cyan:   "#00aeef",
  Magenta:"#ec008c",
  Yellow: "#fff200",
  Black:  "#000000",
  Red:    "#ed1c24",
  Green:  "#00a651",
  Blue:   "#2e3192",
} as const;

const ORDER_WCMYKRGB = ["White", "Cyan", "Magenta", "Yellow", "Black", "Red", "Green", "Blue"] as const;
type PaletteName = typeof ORDER_WCMYKRGB[number];

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return [r, g, b];
}

const PALETTE_RGB: Record<PaletteName, [number, number, number]> = {
  White:  hexToRgb(PALETTE.White),
  Cyan:   hexToRgb(PALETTE.Cyan),
  Magenta:hexToRgb(PALETTE.Magenta),
  Yellow: hexToRgb(PALETTE.Yellow),
  Black:  hexToRgb(PALETTE.Black),
  Red:    hexToRgb(PALETTE.Red),
  Green:  hexToRgb(PALETTE.Green),
  Blue:   hexToRgb(PALETTE.Blue),
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

// Converts binary text (rows of 1s/0s) to ASCII letters
function binaryToAscii(binaryText: string): string {
  const cleanBinary = binaryText.replace(/\s+/g, ""); // remove newlines
  let result = "";

  for (let i = 0; i < cleanBinary.length; i += 8) {
    const byte = cleanBinary.slice(i, i + 8);
    if (byte.length < 8) break; // ignore incomplete byte
    const charCode = parseInt(byte, 2);
    if (!isNaN(charCode)) {
      const char = String.fromCharCode(charCode);
      result += char;
    }
  }

  return result;
}

async function loadIntoCanvas(
  file: File,
  canvas: HTMLCanvasElement,
  downscaleMaxWidth?: number
): Promise<void> {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("2D canvas context unavailable");

  let bmp: ImageBitmap | null = null;
  if ("createImageBitmap" in window) {
    try {
      bmp = await createImageBitmap(file, { imageOrientation: "from-image" as ImageOrientation });
    } catch {
      bmp = null;
    }
  }

  if (bmp) {
    const scale = downscaleMaxWidth ? Math.min(1, downscaleMaxWidth / bmp.width) : 1;
    const w = Math.round(bmp.width * scale);
    const h = Math.round(bmp.height * scale);
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(bmp, 0, 0, w, h);
    bmp.close();
    return;
  }

  const url = URL.createObjectURL(file);
  const img = new Image();
  img.decoding = "async";
  img.src = url;
  await img.decode();

  const scale = downscaleMaxWidth ? Math.min(1, downscaleMaxWidth / img.naturalWidth) : 1;
  const w = Math.round(img.naturalWidth * scale);
  const h = Math.round(img.naturalHeight * scale);
  canvas.width = w;
  canvas.height = h;
  ctx.drawImage(img, 0, 0, w, h);
  URL.revokeObjectURL(url);
}

/** EXACT-HEX ONLY decode: 1 if pixel equals expected W/C/M/Y/K/R/G/B color, else 0. */
function decodeWCMYKRGBExact(imageData: ImageData): string {
  const { data, width, height } = imageData;
  const totalPixels = width * height;
  const numFullBytes = Math.floor(totalPixels / 8);

  let bits = "";
  let i = 0; // RGBA cursor

  for (let byteIdx = 0; byteIdx < numFullBytes; byteIdx++) {
    for (let bitPos = 0; bitPos < 8; bitPos++) {
      const expected: PaletteName = ORDER_WCMYKRGB[bitPos];
      const [er, eg, eb] = PALETTE_RGB[expected];

      const r = data[i], g = data[i + 1], b = data[i + 2];
      // exact hex match only:
      const isOne = (r === er && g === eg && b === eb) ? "1" : "0";
      bits += isOne;

      i += 4; // advance 1 pixel (skip alpha)
    }
  }

  // ignore leftover pixels (<8) at the end
  return bits;
}

const Reader: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [binaryCode, setBinaryCode] = useState<string>("");
  const [asciiCode, setAsciiCode] = useState<string>("");
  const [threshold, setThreshold] = useState<number>(128);
  const [invert, setInvert] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [mode, setMode] = useState<DecodeMode>("mono");
  const [lastDims, setLastDims] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(20);

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
    setLastDims({ w: canvas.width, h: canvas.height });

    if (mode === "mono") {
      const binary = toBinaryCode(imageData, { threshold, invert });
      setBinaryCode(binary);
      setAsciiCode(binaryToAscii(binary));
    } else {
      const bits = decodeWCMYKRGBExact(imageData);
      setBinaryCode(bits);
      setAsciiCode(binaryToAscii(bits));
    }
  }, [threshold, invert, mode]);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !file.type.startsWith("image/")) return;

      setProcessing(true);
      try {
        const canvas = canvasRef.current;
        if (!canvas) return;

        await loadIntoCanvas(file, canvas, 512);

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

  const asciiDownloadHref = useMemo(() => {
    const blob = new Blob([asciiCode], { type: "text/plain;charset=utf-8" });
    return URL.createObjectURL(blob);
  }, [asciiCode]);

  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 900 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <input type="file" accept="image/*" onChange={handleFileChange} />

        {/* Mode switch */}
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          Mode:
          <select value={mode} onChange={(e) => setMode(e.currentTarget.value as DecodeMode)}>
            <option value="mono">Monochrome</option>
            <option value="wcmYKRGB">Color</option>
          </select>
        </label>

        {mode === "mono" && (
          <>
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
          </>
        )}

        <button onClick={processCanvas} disabled={processing || !previewUrl}>
          Rebuild
        </button>

        {binaryCode && (
          <>
            <a href={downloadHref} download="image_binary.txt">
              Binary .txt
            </a>
            <a href={asciiDownloadHref} download="image_ascii.txt">
              ASCII .txt
            </a>
          </>
        )}
      </div>

      {processing && <div>Processing…</div>}

        {previewUrl && (
        <div>
            <p>
            Preview image{lastDims ? ` (${lastDims.w}×${lastDims.h})` : ""} – Zoom:
            <input
                type="number"
                min={1}
                max={20}
                value={zoom}
                onChange={(e) => setZoom(Number(e.currentTarget.value))}
                style={{ width: 60, marginLeft: 8 }}
            />x
            </p>
            <div
            style={{
                overflow: "auto",
                border: "1px solid #ddd",
                width: "100%",
            }}
            >
            <img
                src={previewUrl}
                alt="preview"
                style={{
                imageRendering: "pixelated",
                width: lastDims ? lastDims.w * zoom : "auto",
                height: lastDims ? lastDims.h * zoom : "auto",
                display: "block",
                }}
            />
            </div>
        </div>
        )}


      <canvas ref={canvasRef} style={{ display: "none" }} />

      <div style={{ display: "grid", gap: 6 }}>
        <p style={{ margin: 0 }}>Binary Output:</p>
        <textarea
          value={binaryCode}
          readOnly
          spellCheck={false}
          style={{
            width: "100%",
            minHeight: 200,
            fontFamily: "monospace",
            whiteSpace: "pre",
          }}
        />
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        <p style={{ margin: 0 }}>ASCII Conversion (8 bits per char):</p>
        <textarea
          value={asciiCode}
          readOnly
          spellCheck={false}
          style={{
            width: "100%",
            minHeight: 200,
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
          }}
        />
      </div>
    </div>
  );
};

export default Reader;

import { useEffect, useRef, useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface ImageCropModalProps {
  imageSrc: string | null;
  onComplete: (croppedFile: File) => void;
  onCancel: () => void;
  originalFileName?: string;
  aspectRatio?: number;
}

// 8 handle positions
type Handle = "tl" | "tc" | "tr" | "ml" | "mr" | "bl" | "bc" | "br";

interface CropBox { x: number; y: number; w: number; h: number }

const MIN_SIZE = 30;

const HANDLE_SIZE = 10; // px, half-size for hit area

function getHandlePositions(box: CropBox): Record<Handle, { cx: number; cy: number }> {
  const { x, y, w, h } = box;
  return {
    tl: { cx: x,         cy: y         },
    tc: { cx: x + w / 2, cy: y         },
    tr: { cx: x + w,     cy: y         },
    ml: { cx: x,         cy: y + h / 2 },
    mr: { cx: x + w,     cy: y + h / 2 },
    bl: { cx: x,         cy: y + h     },
    bc: { cx: x + w / 2, cy: y + h     },
    br: { cx: x + w,     cy: y + h     },
  };
}

function cursorForHandle(h: Handle): string {
  const map: Record<Handle, string> = {
    tl: "nw-resize", tc: "n-resize",  tr: "ne-resize",
    ml: "w-resize",                   mr: "e-resize",
    bl: "sw-resize", bc: "s-resize",  br: "se-resize",
  };
  return map[h];
}

export function ImageCropModal({
  imageSrc,
  onComplete,
  onCancel,
  originalFileName = "image.jpg",
  aspectRatio,
}: ImageCropModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef    = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Displayed image dimensions inside the canvas
  const displayRef = useRef({ offX: 0, offY: 0, w: 0, h: 0 });

  const [box, setBox]       = useState<CropBox>({ x: 0, y: 0, w: 0, h: 0 });
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const dragRef = useRef<{
    handle: Handle;
    startX: number; startY: number;
    origBox: CropBox;
  } | null>(null);

  // ── Draw ──────────────────────────────────────────────────────────────
  const draw = useCallback((currentBox: CropBox) => {
    const canvas = canvasRef.current;
    const img    = imgRef.current;
    const d      = displayRef.current;
    if (!canvas || !img || !d.w) return;

    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image
    ctx.drawImage(img, d.offX, d.offY, d.w, d.h);

    // Dark overlay outside crop
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    const { x, y, w, h } = currentBox;
    ctx.fillRect(0,   0,            canvas.width, y);           // top
    ctx.fillRect(0,   y + h,        canvas.width, canvas.height - y - h); // bottom
    ctx.fillRect(0,   y,            x,            h);           // left
    ctx.fillRect(x + w, y,          canvas.width - x - w, h);  // right

    // Crop border
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth   = 1.5;
    ctx.strokeRect(x, y, w, h);

    // 8 handles
    const handles = getHandlePositions(currentBox);
    for (const pos of Object.values(handles)) {
      ctx.fillStyle   = "#ffffff";
      ctx.strokeStyle = "#333";
      ctx.lineWidth   = 1;
      ctx.fillRect(pos.cx - HANDLE_SIZE / 2, pos.cy - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
      ctx.strokeRect(pos.cx - HANDLE_SIZE / 2, pos.cy - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
    }
  }, []);

  // ── Init image ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!imageSrc) { setLoaded(false); return; }

    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const canvas    = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const maxW = container.clientWidth  || 600;
      const maxH = container.clientHeight || 420;

      // Scale image to fit container
      const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);
      const dw    = Math.round(img.naturalWidth  * scale);
      const dh    = Math.round(img.naturalHeight * scale);
      const offX  = Math.round((maxW - dw) / 2);
      const offY  = Math.round((maxH - dh) / 2);

      canvas.width  = maxW;
      canvas.height = maxH;
      displayRef.current = { offX, offY, w: dw, h: dh };

      // Center crop box at 85% of displayed image
      const cw = Math.round(dw * 0.85);
      const ch = aspectRatio ? Math.round(cw / aspectRatio) : Math.round(dh * 0.85);
      const cx = offX + Math.round((dw - cw) / 2);
      const cy = offY + Math.round((dh - ch) / 2);

      const initBox = { x: cx, y: cy, w: cw, h: ch };
      setBox(initBox);
      setLoaded(true);
      draw(initBox);
    };
    img.src = imageSrc;
  }, [imageSrc, aspectRatio, draw]);

  // Redraw whenever box changes
  useEffect(() => { if (loaded) draw(box); }, [box, loaded, draw]);

  // ── Hit test ──────────────────────────────────────────────────────────
  const hitHandle = (mx: number, my: number, b: CropBox): Handle | null => {
    const positions = getHandlePositions(b);
    for (const [key, pos] of Object.entries(positions) as [Handle, { cx: number; cy: number }][]) {
      if (
        mx >= pos.cx - HANDLE_SIZE && mx <= pos.cx + HANDLE_SIZE &&
        my >= pos.cy - HANDLE_SIZE && my <= pos.cy + HANDLE_SIZE
      ) return key;
    }
    return null;
  };

  // ── Mouse events ──────────────────────────────────────────────────────
  const getCanvasXY = (e: React.MouseEvent | MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { mx: e.clientX - rect.left, my: e.clientY - rect.top };
  };

  const onMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { mx, my } = getCanvasXY(e);

    if (!dragRef.current) {
      // Update cursor
      const h = hitHandle(mx, my, box);
      canvas.style.cursor = h ? cursorForHandle(h) : "default";
      return;
    }

    const { handle, startX, startY, origBox } = dragRef.current;
    const dx = mx - startX;
    const dy = my - startY;
    const d  = displayRef.current;

    // Bounds: crop box must stay within displayed image
    const minX = d.offX, minY = d.offY;
    const maxX = d.offX + d.w, maxY = d.offY + d.h;

    let { x, y, w, h } = origBox;

    // Apply delta per handle
    if (handle === "tl" || handle === "ml" || handle === "bl") {
      const nx = Math.min(x + w - MIN_SIZE, Math.max(minX, x + dx));
      w = w + (x - nx); x = nx;
    }
    if (handle === "tr" || handle === "mr" || handle === "br") {
      w = Math.min(maxX - x, Math.max(MIN_SIZE, w + dx));
    }
    if (handle === "tl" || handle === "tc" || handle === "tr") {
      const ny = Math.min(y + h - MIN_SIZE, Math.max(minY, y + dy));
      h = h + (y - ny); y = ny;
    }
    if (handle === "bl" || handle === "bc" || handle === "br") {
      h = Math.min(maxY - y, Math.max(MIN_SIZE, h + dy));
    }

    // Enforce aspect ratio if set
    if (aspectRatio) {
      if (["tl","tr","bl","br","tc","bc"].includes(handle)) {
        w = Math.round(h * aspectRatio);
        if (x + w > maxX) { w = maxX - x; h = Math.round(w / aspectRatio); }
      }
    }

    setBox({ x, y, w, h });
  }, [box, aspectRatio]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const { mx, my } = getCanvasXY(e);
    const h = hitHandle(mx, my, box);
    if (!h) return;
    dragRef.current = { handle: h, startX: mx, startY: my, origBox: { ...box } };
  }, [box]);

  const onMouseUp = useCallback(() => { dragRef.current = null; }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup",   onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup",   onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  // ── Apply crop ────────────────────────────────────────────────────────
  const handleSave = async () => {
    const img = imgRef.current;
    const d   = displayRef.current;
    if (!img || !d.w) return;
    setSaving(true);

    // Map canvas crop coords back to original image coords
    const scaleX = img.naturalWidth  / d.w;
    const scaleY = img.naturalHeight / d.h;
    const srcX   = Math.round((box.x - d.offX) * scaleX);
    const srcY   = Math.round((box.y - d.offY) * scaleY);
    const srcW   = Math.round(box.w * scaleX);
    const srcH   = Math.round(box.h * scaleY);

    const out = document.createElement("canvas");
    out.width  = srcW;
    out.height = srcH;
    out.getContext("2d")!.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH);

    out.toBlob(
      (blob) => {
        if (!blob) { setSaving(false); return; }
        onComplete(new File([blob], originalFileName, { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.92,
    );
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <Dialog
      open={!!imageSrc}
      onOpenChange={(open) => { if (!open) onCancel(); }}
    >
      <DialogContent
        className="max-w-2xl w-full p-0 gap-0 bg-[#111] border-[#333]"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-5 pt-4 pb-3 border-b border-[#333]">
          <DialogTitle className="text-sm font-semibold text-white tracking-wide">
            Crop Image
          </DialogTitle>
        </DialogHeader>

        {/* Canvas area */}
        <div
          ref={containerRef}
          style={{ width: "100%", height: 420, background: "#111", position: "relative" }}
        >
          <canvas
            ref={canvasRef}
            onMouseDown={onMouseDown}
            style={{ display: "block", userSelect: "none" }}
          />
          {!loaded && imageSrc && (
            <div style={{
              position: "absolute", inset: 0, display: "flex",
              alignItems: "center", justifyContent: "center",
              color: "#666", fontSize: 13, pointerEvents: "none",
            }}>
              Loading image…
            </div>
          )}
        </div>

        <DialogFooter className="px-5 py-4 border-t border-[#333] bg-[#1a1a1a] gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-[#444] text-white hover:bg-[#333] gap-1"
          >
            <X className="w-4 h-4" /> Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving || !loaded}
            className="bg-[#bf953f] hover:bg-[#a67c2e] text-white gap-1"
          >
            <Check className="w-4 h-4" />
            {saving ? "Saving…" : "Apply Crop"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

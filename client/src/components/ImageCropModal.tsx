import { useEffect, useRef, useState, useCallback } from "react";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.min.css";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  ZoomIn,
  ZoomOut,
  Check,
  X,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
} from "lucide-react";

interface ImageCropModalProps {
  imageSrc: string | null;
  onComplete: (croppedFile: File) => void;
  onCancel: () => void;
  originalFileName?: string;
  aspectRatio?: number;
}

export function ImageCropModal({
  imageSrc,
  onComplete,
  onCancel,
  originalFileName = "image.jpg",
  aspectRatio,
}: ImageCropModalProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const cropperRef = useRef<Cropper | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [zoomVal, setZoomVal] = useState(1);
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);
  const [scaleX, setScaleX] = useState(1);
  const [scaleY, setScaleY] = useState(1);

  /* ── Helpers ─────────────────────────────────────────────────────────── */

  const destroyCropper = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    if (cropperRef.current) { cropperRef.current.destroy(); cropperRef.current = null; }
    setReady(false);
    setZoomVal(1);
    setScaleX(1);
    setScaleY(1);
  }, []);

  const buildCropper = useCallback(() => {
    const img = imgRef.current;
    if (!img || cropperRef.current) return; // already exists

    const cropper = new Cropper(img, {
      aspectRatio: aspectRatio ?? NaN,
      viewMode: 1,          // canvas stays inside container
      dragMode: "move",     // drag moves the image, not creates a new crop
      autoCropArea: 0.85,
      cropBoxResizable: true,
      cropBoxMovable: true,
      movable: true,
      zoomable: true,
      zoomOnWheel: true,
      wheelZoomRatio: 0.1,
      responsive: true,
      restore: true,
      guides: true,
      center: true,
      highlight: false,
      background: true,
      toggleDragModeOnDblclick: false,
      minCropBoxWidth: 20,
      minCropBoxHeight: 20,
      ready() {
        setReady(true);
        // Read initial zoom from Cropper to sync slider
        const data = (this as any).imageData;
        if (data?.ratio != null) setZoomVal(data.ratio);
      },
      zoom(e) {
        const r = parseFloat(e.detail.ratio.toFixed(4));
        const clamped = Math.min(Math.max(r, 0.1), 5);
        if (r !== clamped) { e.preventDefault(); cropper.zoomTo(clamped); }
        setZoomVal(clamped);
      },
    });

    cropperRef.current = cropper;
  }, [aspectRatio]);

  /* Wait for the Dialog open-animation to finish (≈200 ms in shadcn/ui),
     THEN check whether the image is already loaded (blob / cache) or
     wait for onLoad. A 300 ms buffer comfortably covers the animation. */
  const scheduleBuild = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      const img = imgRef.current;
      if (!img) return;
      if (img.complete && img.naturalWidth > 0) {
        buildCropper();
      }
      // Otherwise onLoad will call buildCropper directly
    }, 300);
  }, [buildCropper]);

  /* ── Effects ─────────────────────────────────────────────────────────── */

  useEffect(() => {
    if (!imageSrc) {
      destroyCropper();
      return;
    }
    // Destroy any previous instance, then schedule a fresh build
    destroyCropper();
    scheduleBuild();
  }, [imageSrc]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => destroyCropper(), []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Control handlers ────────────────────────────────────────────────── */

  const handleZoomChange = (val: number[]) => {
    const v = val[0];
    setZoomVal(v);
    cropperRef.current?.zoomTo(v);
  };

  const handleReset = () => {
    cropperRef.current?.reset();
    setZoomVal(1);
    setScaleX(1);
    setScaleY(1);
  };

  const handleFlipH = () => {
    const next = scaleX * -1;
    setScaleX(next);
    cropperRef.current?.scaleX(next);
  };

  const handleFlipV = () => {
    const next = scaleY * -1;
    setScaleY(next);
    cropperRef.current?.scaleY(next);
  };

  const handleSave = async () => {
    if (!cropperRef.current || !ready) return;
    setSaving(true);
    try {
      const canvas = cropperRef.current.getCroppedCanvas({
        maxWidth: 2048,
        maxHeight: 2048,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: "high",
      });
      await new Promise<void>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) { reject(new Error("toBlob failed")); return; }
            onComplete(new File([blob], originalFileName, { type: "image/jpeg" }));
            resolve();
          },
          "image/jpeg",
          0.92,
        );
      });
    } catch {
      setSaving(false);
    }
  };

  /* ── Render ──────────────────────────────────────────────────────────── */

  return (
    <Dialog
      open={!!imageSrc}
      onOpenChange={(open) => { if (!open) { destroyCropper(); onCancel(); } }}
    >
      <DialogContent
        className="max-w-2xl w-full p-0 gap-0"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-5 pt-4 pb-3 border-b">
          <DialogTitle className="text-sm font-semibold tracking-wide">
            Crop Image
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Drag image to reposition · Drag handles to resize crop · Scroll to zoom
          </DialogDescription>
        </DialogHeader>

        {/*
          Cropper container.
          • No overflow:hidden — Cropper.js manages its own clipping internally.
          • position:relative is required so Cropper.js can absolute-position
            its canvas, drag-box, crop-box, and modal overlay correctly.
          • The explicit height gives Cropper.js a stable bounding box to
            fill. Without it, Cropper.js falls back to the image's intrinsic
            height which can be unexpectedly large or small.
        */}
        <div
          id="cropper-host"
          style={{
            width: "100%",
            height: 420,
            background: "#111",
            position: "relative",
          }}
        >
          {imageSrc && (
            <img
              /*
                key=imageSrc ensures a fresh DOM node each time the source
                changes, so Cropper.js always receives an un-initialized
                <img> element.
              */
              key={imageSrc}
              ref={imgRef}
              src={imageSrc}
              alt="Crop source"
              /*
                onLoad fires once the browser has decoded the pixels.
                We pair it with the 300 ms timer so whichever happens
                last (image load vs animation end) triggers the build.
              */
              onLoad={buildCropper}
              style={{ display: "block" }}
            />
          )}

          {/* Shown until Cropper.js calls its ready() callback */}
          {!ready && imageSrc && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#777",
                fontSize: 13,
                pointerEvents: "none",
                zIndex: 10,
              }}
            >
              Initializing cropper…
            </div>
          )}
        </div>

        {/* ── Controls ── */}
        <div className="px-5 py-3 bg-background space-y-3 border-t">
          {/* Zoom */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => cropperRef.current?.zoom(-0.1)}
              disabled={!ready}
              title="Zoom out"
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <Slider
              min={0.1}
              max={5}
              step={0.01}
              value={[zoomVal]}
              onValueChange={handleZoomChange}
              disabled={!ready}
              className="flex-1"
            />
            <button
              type="button"
              onClick={() => cropperRef.current?.zoom(0.1)}
              disabled={!ready}
              title="Zoom in"
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button type="button" variant="ghost" size="sm" onClick={handleReset}
                disabled={!ready} className="gap-1 text-xs h-7 px-2">
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={handleFlipH}
                disabled={!ready} className="gap-1 text-xs h-7 px-2">
                <FlipHorizontal className="w-3.5 h-3.5" /> Flip H
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={handleFlipV}
                disabled={!ready} className="gap-1 text-xs h-7 px-2">
                <FlipVertical className="w-3.5 h-3.5" /> Flip V
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground hidden sm:block">
              Drag corners / edges to resize crop box
            </p>
          </div>
        </div>

        <DialogFooter className="px-5 pb-4 pt-3 gap-2 border-t">
          <Button type="button" variant="outline"
            onClick={() => { destroyCropper(); onCancel(); }} className="gap-1">
            <X className="w-4 h-4" /> Cancel
          </Button>
          <Button type="button" onClick={handleSave}
            disabled={saving || !ready}
            className="gap-1 bg-[#bf953f] hover:bg-[#a67c2e] text-white">
            <Check className="w-4 h-4" />
            {saving ? "Saving…" : "Apply Crop"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

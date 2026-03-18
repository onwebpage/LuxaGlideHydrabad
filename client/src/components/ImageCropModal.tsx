import { useEffect, useRef, useState } from "react";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.min.css";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ZoomIn, ZoomOut, Check, X, RotateCcw, FlipHorizontal, FlipVertical } from "lucide-react";

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
  const imageRef = useRef<HTMLImageElement>(null);
  const cropperRef = useRef<Cropper | null>(null);
  const [zoom, setZoom] = useState(0);
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!imageSrc || !imageRef.current) return;

    setReady(false);
    setZoom(0);

    const cropper = new Cropper(imageRef.current, {
      aspectRatio: aspectRatio ?? NaN,
      viewMode: 1,
      dragMode: "move",
      autoCropArea: 0.8,
      cropBoxResizable: true,
      cropBoxMovable: true,
      movable: true,
      zoomable: true,
      zoomOnWheel: true,
      wheelZoomRatio: 0.1,
      responsive: true,
      restore: false,
      guides: true,
      center: true,
      highlight: false,
      background: true,
      toggleDragModeOnDblclick: false,
      ready() {
        setReady(true);
      },
      zoom(event) {
        const ratio = event.detail.ratio;
        const clampedRatio = Math.min(Math.max(ratio, 0.1), 3);
        if (ratio !== clampedRatio) {
          event.preventDefault();
          cropper.zoomTo(clampedRatio);
        }
        setZoom(clampedRatio);
      },
    });

    cropperRef.current = cropper;

    return () => {
      cropper.destroy();
      cropperRef.current = null;
      setReady(false);
    };
  }, [imageSrc, aspectRatio]);

  const handleZoomSlider = (value: number[]) => {
    const v = value[0];
    setZoom(v);
    cropperRef.current?.zoomTo(v);
  };

  const handleZoomIn = () => {
    cropperRef.current?.zoom(0.1);
  };

  const handleZoomOut = () => {
    cropperRef.current?.zoom(-0.1);
  };

  const handleReset = () => {
    cropperRef.current?.reset();
    setZoom(0);
  };

  const handleFlipH = () => {
    const data = cropperRef.current?.getData();
    const scaleX = data ? (cropperRef.current as any).imageData?.scaleX ?? 1 : 1;
    cropperRef.current?.scaleX(scaleX === -1 ? 1 : -1);
  };

  const handleFlipV = () => {
    const data = cropperRef.current?.getData();
    const scaleY = data ? (cropperRef.current as any).imageData?.scaleY ?? 1 : 1;
    cropperRef.current?.scaleY(scaleY === -1 ? 1 : -1);
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
            if (!blob) { reject(new Error("Failed to export crop")); return; }
            const file = new File([blob], originalFileName, { type: "image/jpeg" });
            onComplete(file);
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

  return (
    <Dialog open={!!imageSrc} onOpenChange={(open) => { if (!open) onCancel(); }}>
      <DialogContent
        className="max-w-2xl w-full p-0 gap-0"
        style={{ overflow: "hidden" }}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-5 pt-4 pb-3 border-b">
          <DialogTitle className="text-sm font-semibold tracking-wide">
            Crop Image
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Drag image to reposition · Drag handles to resize crop · Scroll to zoom
          </DialogDescription>
        </DialogHeader>

        {/* Cropper area */}
        <div
          style={{
            width: "100%",
            height: 420,
            background: "#1a1a1a",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {imageSrc && (
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop source"
              style={{
                display: "block",
                maxWidth: "100%",
                maxHeight: "100%",
              }}
            />
          )}
        </div>

        {/* Controls */}
        <div className="px-5 py-3 bg-background space-y-3 border-t">
          {/* Zoom row */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleZoomOut}
              className="text-muted-foreground hover:text-foreground shrink-0 transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <Slider
              min={0.1}
              max={3}
              step={0.01}
              value={[zoom || 0.1]}
              onValueChange={handleZoomSlider}
              className="flex-1"
            />
            <button
              type="button"
              onClick={handleZoomIn}
              className="text-muted-foreground hover:text-foreground shrink-0 transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
          </div>

          {/* Action row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="gap-1 text-xs h-7 px-2"
                title="Reset"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleFlipH}
                className="gap-1 text-xs h-7 px-2"
                title="Flip horizontal"
              >
                <FlipHorizontal className="w-3.5 h-3.5" />
                Flip H
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleFlipV}
                className="gap-1 text-xs h-7 px-2"
                title="Flip vertical"
              >
                <FlipVertical className="w-3.5 h-3.5" />
                Flip V
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground hidden sm:block">
              Drag corners/edges to resize crop box
            </p>
          </div>
        </div>

        <DialogFooter className="px-5 pb-4 pt-3 gap-2 border-t">
          <Button type="button" variant="outline" onClick={onCancel} className="gap-1">
            <X className="w-4 h-4" />
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving || !ready}
            className="gap-1 bg-[#bf953f] hover:bg-[#a67c2e] text-white"
          >
            <Check className="w-4 h-4" />
            {saving ? "Saving…" : "Apply Crop"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

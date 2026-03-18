import { useState, useCallback } from "react";
import EasyCrop, { Area } from "react-easy-crop";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ZoomIn, ZoomOut, Check, X, RotateCcw } from "lucide-react";

interface ImageCropModalProps {
  imageSrc: string | null;
  onComplete: (croppedFile: File) => void;
  onCancel: () => void;
  originalFileName?: string;
  aspectRatio?: number;
}

async function exportCrop(imageSrc: string, pixelCrop: Area, fileName: string): Promise<File> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width  = pixelCrop.width;
      canvas.height = pixelCrop.height;
      canvas.getContext("2d")!.drawImage(
        image,
        pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
        0, 0, pixelCrop.width, pixelCrop.height
      );
      canvas.toBlob(blob => {
        if (!blob) return reject(new Error("toBlob failed"));
        resolve(new File([blob], fileName, { type: "image/jpeg" }));
      }, "image/jpeg", 0.92);
    };
    image.onerror = reject;
    image.src = imageSrc;
  });
}

export function ImageCropModal({
  imageSrc,
  onComplete,
  onCancel,
  originalFileName = "image.jpg",
  aspectRatio = 1,
}: ImageCropModalProps) {
  const [crop,   setCrop]   = useState({ x: 0, y: 0 });
  const [zoom,   setZoom]   = useState(1);
  const [saving, setSaving] = useState(false);
  const [pixelCrop, setPixelCrop] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setPixelCrop(croppedPixels);
  }, []);

  const handleReset = () => { setCrop({ x: 0, y: 0 }); setZoom(1); };

  const handleSave = async () => {
    if (!imageSrc || !pixelCrop) return;
    setSaving(true);
    try {
      const file = await exportCrop(imageSrc, pixelCrop, originalFileName);
      onComplete(file);
    } catch {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!imageSrc} onOpenChange={open => !open && onCancel()}>
      <DialogContent className="max-w-2xl w-full p-0 gap-0" style={{ overflow: "hidden" }}>
        <DialogHeader className="px-5 pt-4 pb-3 border-b">
          <DialogTitle className="text-sm font-semibold tracking-wide">Adjust Image</DialogTitle>
          <DialogDescription className="sr-only">Drag to reposition · Pinch or scroll to zoom · Drag handles to resize</DialogDescription>
        </DialogHeader>

        {/* Crop area — fixed height container, react-easy-crop fills it */}
        <div style={{ position: "relative", width: "100%", height: 420, background: "#111" }}>
          {imageSrc && (
            <EasyCrop
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspectRatio}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              showGrid
              cropShape="rect"
              style={{
                containerStyle: {
                  position: "absolute", inset: 0,
                },
                mediaStyle: {},
                cropAreaStyle: {
                  border: "2px solid #bf953f",
                  boxShadow: "0 0 0 9999px rgba(0,0,0,0.6)",
                  borderRadius: 4,
                },
              }}
            />
          )}
        </div>

        {/* Controls */}
        <div className="px-5 py-4 bg-background space-y-3 border-t">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setZoom(z => Math.max(1, +(z - 0.1).toFixed(2)))}
              className="text-muted-foreground hover:text-foreground shrink-0"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <Slider
              min={1} max={4} step={0.01}
              value={[zoom]}
              onValueChange={([v]) => setZoom(v)}
              className="flex-1"
            />
            <button
              onClick={() => setZoom(z => Math.min(4, +(z + 0.1).toFixed(2)))}
              className="text-muted-foreground hover:text-foreground shrink-0"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1 text-xs">
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </Button>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              Drag to reposition · Scroll or pinch to zoom
            </p>
          </div>
        </div>

        <DialogFooter className="px-5 pb-4 pt-3 gap-2 border-t">
          <Button variant="outline" onClick={onCancel} className="gap-1">
            <X className="w-4 h-4" /> Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !pixelCrop}
            className="gap-1 bg-[#bf953f] hover:bg-[#b8962d] text-white"
          >
            <Check className="w-4 h-4" />
            {saving ? "Saving..." : "Apply"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ZoomIn, ZoomOut, Check, X } from "lucide-react";

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageCropModalProps {
  imageSrc: string | null;
  onComplete: (croppedFile: File) => void;
  onCancel: () => void;
  originalFileName?: string;
}

async function getCroppedImage(imageSrc: string, cropArea: CropArea, fileName: string): Promise<File> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  canvas.width = cropArea.width;
  canvas.height = cropArea.height;
  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(
    image,
    cropArea.x, cropArea.y,
    cropArea.width, cropArea.height,
    0, 0,
    cropArea.width, cropArea.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(new File([blob!], fileName, { type: "image/jpeg" }));
    }, "image/jpeg", 0.92);
  });
}

export function ImageCropModal({ imageSrc, onComplete, onCancel, originalFileName = "image.jpg" }: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);
  const [saving, setSaving] = useState(false);

  const onCropComplete = useCallback((_: any, croppedPixels: CropArea) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setSaving(true);
    try {
      const file = await getCroppedImage(imageSrc, croppedAreaPixels, originalFileName);
      onComplete(file);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!imageSrc} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-lg w-full p-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="text-base font-semibold">Adjust Image</DialogTitle>
        </DialogHeader>

        {/* Crop Area — fixed 1:1 square frame */}
        <div className="relative w-full" style={{ height: "360px", background: "#111" }}>
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              showGrid={false}
              style={{
                containerStyle: { borderRadius: 0 },
                cropAreaStyle: { border: "2px solid #bf953f", borderRadius: 4 },
              }}
            />
          )}
        </div>

        {/* Zoom Controls */}
        <div className="px-6 py-4 space-y-3 bg-background">
          <div className="flex items-center gap-3">
            <button onClick={() => setZoom((z) => Math.max(1, z - 0.1))} className="text-muted-foreground hover:text-foreground transition-colors">
              <ZoomOut className="w-5 h-5" />
            </button>
            <Slider
              min={1}
              max={3}
              step={0.01}
              value={[zoom]}
              onValueChange={([v]) => setZoom(v)}
              className="flex-1"
            />
            <button onClick={() => setZoom((z) => Math.min(3, z + 0.1))} className="text-muted-foreground hover:text-foreground transition-colors">
              <ZoomIn className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground text-center">Drag to reposition · Pinch or scroll to zoom</p>
        </div>

        <DialogFooter className="px-4 pb-4 gap-2">
          <Button variant="outline" onClick={onCancel} className="gap-1">
            <X className="w-4 h-4" /> Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-1 bg-[#bf953f] hover:bg-[#b8962d] text-white">
            <Check className="w-4 h-4" /> {saving ? "Saving..." : "Apply"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useRef, useCallback } from "react";
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, RotateCcw, ZoomIn, ZoomOut, Crop as CropIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
  aspectRatio?: number;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 70 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

async function getCroppedImg(image: HTMLImageElement, crop: PixelCrop): Promise<Blob> {
  const canvas = document.createElement("canvas");
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width * scaleX;
  canvas.height = crop.height * scaleY;
  const ctx = canvas.getContext("2d")!;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(
    image,
    crop.x * scaleX, crop.y * scaleY,
    crop.width * scaleX, crop.height * scaleY,
    0, 0,
    canvas.width, canvas.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas is empty"));
    }, "image/jpeg", 0.92);
  });
}

export default function ImageCropper({ imageSrc, onCropComplete, onCancel, aspectRatio = 1 }: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const imgRef = useRef<HTMLImageElement>(null);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, aspectRatio));
  }, [aspectRatio]);

  const handleConfirm = async () => {
    if (!completedCrop || !imgRef.current) return;
    const blob = await getCroppedImg(imgRef.current, completedCrop);
    onCropComplete(blob);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-xl p-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md glass rounded-2xl border border-border/50 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
            <div className="flex items-center gap-2">
              <CropIcon className="h-4 w-4 text-accent" />
              <h3 className="font-display text-sm font-bold text-foreground">Crop Your Photo</h3>
            </div>
            <button onClick={onCancel} className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Crop area */}
          <div className="p-4 flex justify-center bg-black/20">
            <ReactCrop
              crop={crop}
              onChange={(_, pc) => setCrop(pc)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectRatio}
              circularCrop
              className="max-h-[50vh]"
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop"
                onLoad={onImageLoad}
                style={{ transform: `scale(${scale})`, maxHeight: "50vh", transition: "transform 0.2s" }}
              />
            </ReactCrop>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center justify-center gap-4 px-5 py-3 border-t border-border/20">
            <button onClick={() => setScale(Math.max(0.5, scale - 0.1))}
              className="h-8 w-8 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <ZoomOut className="h-4 w-4" />
            </button>
            <div className="text-xs text-muted-foreground w-12 text-center">{Math.round(scale * 100)}%</div>
            <button onClick={() => setScale(Math.min(3, scale + 0.1))}
              className="h-8 w-8 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <ZoomIn className="h-4 w-4" />
            </button>
            <button onClick={() => setScale(1)}
              className="h-8 w-8 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 px-5 py-4 border-t border-border/30">
            <Button variant="outline" onClick={onCancel} className="flex-1 h-10 rounded-xl">Cancel</Button>
            <Button onClick={handleConfirm} className="flex-1 h-10 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground glow-accent">
              <Check className="h-4 w-4 mr-1.5" /> Apply Crop
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

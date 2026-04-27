'use client';

import { useCallback, useEffect, useState } from 'react';
import Cropper, { type Area, type Point } from 'react-easy-crop';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { getCroppedJpegBlob } from '@/lib/crop-image';
import { cn } from '@/lib/utils';

type AvatarCropDialogProps = {
  imageSrc: null | string;
  onCancel: () => void;
  onComplete: (blob: Blob) => Promise<void>;
  open: boolean;
};

export function AvatarCropDialog({ imageSrc, onCancel, onComplete, open }: AvatarCropDialogProps): React.JSX.Element {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [working, setWorking] = useState(false);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  useEffect(() => {
    if (open && imageSrc) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
    }
  }, [imageSrc, open]);

  const handleApply = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) {
      return;
    }
    setWorking(true);
    try {
      const blob = await getCroppedJpegBlob(imageSrc, croppedAreaPixels, 'image/jpeg');
      await onComplete(blob);
    } finally {
      setWorking(false);
    }
  }, [croppedAreaPixels, imageSrc, onComplete]);

  return (
    <Dialog
      onOpenChange={(o) => {
        if (!o) {
          onCancel();
        }
      }}
      open={open}
    >
      <DialogContent className="flex max-h-[min(92dvh,720px)] !max-w-lg flex-col gap-0 overflow-hidden p-0 !pt-12">
        <DialogHeader className="border-b border-border/50 px-4 py-3 sm:px-5">
          <DialogTitle>Adjust photo</DialogTitle>
          <DialogDescription>Drag to reposition, use the slider to zoom, then save.</DialogDescription>
        </DialogHeader>
        <div className="relative min-h-[min(55dvh,360px)] w-full bg-black/80">
          {imageSrc ? (
            <Cropper
              aspect={1}
              crop={crop}
              cropShape="round"
              image={imageSrc}
              maxZoom={3}
              minZoom={1}
              objectFit="contain"
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              showGrid={false}
              zoom={zoom}
            />
          ) : null}
        </div>
        <div className="space-y-2 border-t border-border/50 px-4 py-3 sm:px-5">
          <Label className="text-xs text-muted-foreground" htmlFor="avatar-zoom">
            Zoom
          </Label>
          <input
            className={cn(
              'h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary',
              '[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary'
            )}
            id="avatar-zoom"
            max={3}
            min={1}
            onChange={(e) => {
              setZoom(Number(e.target.value));
            }}
            step={0.01}
            type="range"
            value={zoom}
          />
        </div>
        <DialogFooter className="gap-2 border-t border-border/50 px-4 py-3 sm:flex-row sm:justify-end sm:px-5 sm:py-3">
          <Button disabled={working} onClick={onCancel} type="button" variant="outline">
            Cancel
          </Button>
          <Button disabled={!croppedAreaPixels || working} onClick={handleApply} type="button">
            {working ? 'Saving…' : 'Save photo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

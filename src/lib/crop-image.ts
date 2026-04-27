import { type Area } from 'react-easy-crop';

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (err) => reject(err));
    if (url.startsWith('http://') || url.startsWith('https://')) {
      image.setAttribute('crossOrigin', 'anonymous');
    }
    image.src = url;
  });
}

const OUTPUT_MAX = 800;

/**
 * Crops the image to a square/round region and downscales so uploads stay reasonable in size.
 */
export async function getCroppedJpegBlob(
  imageSrc: string,
  pixelCrop: Area,
  mimeType: 'image/jpeg' | 'image/webp' = 'image/jpeg'
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  const w = Math.max(1, Math.round(pixelCrop.width));
  const h = Math.max(1, Math.round(pixelCrop.height));
  const scale = Math.min(1, OUTPUT_MAX / Math.max(w, h));
  const outW = Math.round(w * scale);
  const outH = Math.round(h * scale);
  canvas.width = outW;
  canvas.height = outH;
  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, outW, outH);

  const quality = mimeType === 'image/webp' ? 0.88 : 0.9;
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), mimeType, quality);
  });
}

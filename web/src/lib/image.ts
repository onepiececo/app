// Cloudinary Fetch URL builder.
// Pull a source image through Cloudinary's transformation pipeline without uploading anything.
// docs https://cloudinary.com/documentation/fetch_remote_images

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";

type FetchOptions = {
  width?: number;
  height?: number;
  // Blur level, 1 to 2000. Useful for the cover guess clue.
  blur?: number;
  // Quality 1 to 100, or "auto".
  quality?: number | "auto";
  // Format conversion, "auto" picks AVIF or WebP per client capability.
  format?: "auto" | "webp" | "avif" | "jpg" | "png";
};

export const cloudinaryFetch = (sourceURL: string, opts: FetchOptions = {}): string => {
  if (!CLOUD_NAME || !sourceURL) return sourceURL;

  const params: string[] = [];
  params.push(`f_${opts.format ?? "auto"}`);
  params.push(`q_${opts.quality ?? "auto"}`);
  if (opts.width) params.push(`w_${opts.width}`);
  if (opts.height) params.push(`h_${opts.height}`);
  if (opts.blur && opts.blur > 0) params.push(`e_blur:${opts.blur}`);

  const encoded = encodeURIComponent(sourceURL);
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/${params.join(",")}/${encoded}`;
};

// Returns true when a Cloudinary cloud name is configured. Render an unproxied image when false.
export const hasCloudinary = () => CLOUD_NAME.length > 0;

import React from "react";

type Props = {
  src: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
  srcSet?: string;
  priority?: boolean;
  style?: React.CSSProperties;
};

/**
 * Lightweight image wrapper to improve perceived performance:
 * - uses `loading=lazy` (unless `priority` is true)
 * - uses `decoding=\"async\"`
 * - accepts width/height to avoid layout shift
 * - accepts optional srcSet/sizes for responsive images
 *
 * This is intentionally small — for full optimization use an image CDN (Cloudinary, Imgix)
 * or a build pipeline to pre-generate resized WebP/AVIF assets.
 */
export const OptimizedImage: React.FC<Props> = ({
  src,
  alt = "",
  className = "",
  width,
  height,
  sizes,
  srcSet,
  priority = false,
  style,
}) => {
  const loading = priority ? "eager" : "lazy";

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
      draggable={false}
      width={width}
      height={height}
      srcSet={srcSet}
      sizes={sizes}
      style={style}
    />
  );
};

export default OptimizedImage;

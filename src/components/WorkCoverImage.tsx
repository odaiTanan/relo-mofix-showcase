import { useEffect, useState } from "react";

type WorkCoverImageProps = {
  sources: string[];
  alt: string;
  className?: string;
  /** Instagram reel/post URL — used as last-resort card preview when image sources fail */
  embedUrl?: string | null;
};

/** Tries cover sources in order; falls back to a clipped Instagram embed if needed. */
export function WorkCoverImage({ sources, alt, className, embedUrl }: WorkCoverImageProps) {
  const [index, setIndex] = useState(0);
  const sourcesKey = sources.join("|");

  useEffect(() => {
    setIndex(0);
  }, [sourcesKey]);

  const src = sources[index];

  if (!src) {
    if (embedUrl) {
      return (
        <iframe
          className={`work-cover-embed ${className || ""}`.trim()}
          src={`${embedUrl}/embed`}
          title={alt}
          loading="lazy"
          tabIndex={-1}
          aria-hidden="true"
        />
      );
    }
    return null;
  }

  return (
    <img
      className={className}
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setIndex((current) => current + 1)}
    />
  );
}

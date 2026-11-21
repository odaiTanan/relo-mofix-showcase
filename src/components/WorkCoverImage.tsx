import { useEffect, useState } from "react";

type WorkCoverImageProps = {
  sources: string[];
  alt: string;
  className?: string;
};

/** Tries cover sources in order; Instagram CDN needs no-referrer to load. */
export function WorkCoverImage({ sources, alt, className }: WorkCoverImageProps) {
  const [index, setIndex] = useState(0);
  const sourcesKey = sources.join("|");

  useEffect(() => {
    setIndex(0);
  }, [sourcesKey]);

  const src = sources[index];
  if (!src) return null;

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

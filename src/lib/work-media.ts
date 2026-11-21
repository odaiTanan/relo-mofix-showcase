import type { WorkRecord } from "./api";

export function getInstagramUrls(embedCode: string | null | undefined) {
  return [
    ...new Set(
      (embedCode || "").match(
        /https?:\/\/(?:www\.)?instagram\.com\/(?:reel|p|tv)\/[A-Za-z0-9_-]+(?:\/[^"'<> \t\r\n]*)?/gi,
      ) || [],
    ),
  ].map((url) => url.split(/[?#]/)[0].replace(/\/+$/, ""));
}

export function resolveLocalImageUrl(imageUrl: string, fallbackOrigin?: string) {
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  const apiUrl = fallbackOrigin || import.meta.env.VITE_API_URL || window.location.origin;
  const apiOrigin = /^https?:\/\//i.test(apiUrl) ? new URL(apiUrl).origin : window.location.origin;
  return new URL(imageUrl, `${apiOrigin}/`).toString();
}

/** Cover candidates for a work: uploaded image → API thumbnail → Instagram media URL */
export function getWorkCoverSources(
  work: Pick<WorkRecord, "image_url" | "thumbnail_url" | "embed_code">,
  resolveUploaded: (url: string) => string = resolveLocalImageUrl,
  fallbackUrl?: string,
): string[] {
  const sources: string[] = [];
  if (work.image_url) sources.push(resolveUploaded(work.image_url));
  if (work.thumbnail_url) sources.push(work.thumbnail_url);
  if (fallbackUrl) sources.push(fallbackUrl);
  return [...new Set(sources.filter(Boolean))];
}

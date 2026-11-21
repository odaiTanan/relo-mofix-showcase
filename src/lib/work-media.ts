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

export function getInstagramThumbnailUrl(embedCode: string | null | undefined) {
  const reelUrl = getInstagramUrls(embedCode)[0];
  if (!reelUrl) return null;

  const match = reelUrl.match(/instagram\.com\/(reel|p|tv)\/([A-Za-z0-9_-]+)/i);
  if (!match) return null;

  return `https://www.instagram.com/${match[1]}/${match[2]}/media/?size=l`;
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
): string[] {
  const sources: string[] = [];
  if (work.image_url) sources.push(resolveUploaded(work.image_url));
  if (work.thumbnail_url) sources.push(work.thumbnail_url);
  const igThumb = getInstagramThumbnailUrl(work.embed_code);
  if (igThumb) sources.push(igThumb);
  return [...new Set(sources.filter(Boolean))];
}

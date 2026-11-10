/** Recover the reviewed original behind either a Next image URL or a static variant. */
export function originalImagePath(src: string, baseUrl: string): string {
  const url = new URL(src, baseUrl);
  return url.searchParams.get('url') || url.pathname;
}

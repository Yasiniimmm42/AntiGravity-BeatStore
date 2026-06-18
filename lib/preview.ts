export function getPreviewUrl(taggedAudioUrl: string | null | undefined): string | null {
  if (!taggedAudioUrl) return null;
  const filename = taggedAudioUrl.replace(/^\/uploads\//, "");
  return `/api/preview/${filename}`;
}

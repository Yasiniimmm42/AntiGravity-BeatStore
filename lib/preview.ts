// Önizleme artık doğrudan bir URL değil, AudioPlayer'ın token alıp blob
// olarak fetch etmesi için kullandığı bare dosya adını döndürür.
export function getPreviewFilename(taggedAudioUrl: string | null | undefined): string | null {
  if (!taggedAudioUrl) return null;
  return taggedAudioUrl.replace(/^\/uploads\//, "");
}

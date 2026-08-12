/** Bump this when replacing PWA / favicon artwork so installed apps fetch new icons. */
export const pwaAssetRevision = "20260812";

export function withPwaAssetRevision(path: string): string {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}v=${pwaAssetRevision}`;
}

export function pwaIconPath(size: number): string {
  return withPwaAssetRevision(`/icons/icon-${size}x${size}.png`);
}

export const pwaMaskableIconPath = withPwaAssetRevision(
  "/icons/maskable-icon-512x512.png"
);

export const pwaAppleTouchIconPath = withPwaAssetRevision("/apple-touch-icon.png");

export const brandMarkPath = withPwaAssetRevision("/images/shuleos-mark.png");

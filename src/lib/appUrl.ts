export function getBasePath(): string {
  const bp = process.env.NEXT_PUBLIC_BASE_PATH || '';
  if (!bp) return '';
  return bp.startsWith('/') ? bp : `/${bp}`;
}

// Returns the public app root (origin + basePath)
export function getAppRootUrl(): string {
  const basePath = getBasePath();
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${basePath}`;
  }
  const site = process.env.NEXT_PUBLIC_SITE_URL || '';
  return site ? `${site.replace(/\/$/, '')}${basePath}` : basePath || '/';
}

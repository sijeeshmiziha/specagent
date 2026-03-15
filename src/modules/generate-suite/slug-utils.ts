/**
 * URL slug and class name utilities for POM generation.
 */

/** Convert a URL to a page slug for use in file names and identifiers. */
export function urlToPageSlug(url: string, baseUrl: string): string {
  try {
    const parsed = new URL(url);
    const base = new URL(baseUrl);
    let pathname = parsed.pathname.replace(base.pathname, '');
    if (!pathname || pathname === '/') return 'home';
    pathname = pathname.replace(/^\//, '').replace(/\/$/, '');
    return (
      pathname
        .replace(/\//g, '-')
        .replace(/[^a-zA-Z0-9-]/g, '')
        .toLowerCase()
        .slice(0, 50) || 'page'
    );
  } catch {
    return 'page';
  }
}

/** Convert a hyphenated slug to camelCase, e.g. "recover-initiate" → "recoverInitiate". */
export function slugToCamelCase(slug: string): string {
  return slug.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

/** Convert a slug to a PascalCase class name, e.g. "about-us" → "AboutUsPage". */
export function slugToClassName(slug: string): string {
  const pascal = slug
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
  return `${pascal}Page`;
}

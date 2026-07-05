function pathMatches(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Highlight only the most specific nav item for the current path. */
export function isNavItemActive(
  pathname: string,
  href: string,
  allHrefs: string[]
) {
  if (!pathMatches(pathname, href)) return false;

  const bestMatch = allHrefs
    .filter((candidate) => pathMatches(pathname, candidate))
    .sort((a, b) => b.length - a.length)[0];

  return bestMatch === href;
}

// Source - https://stackoverflow.com/a
// Posted by Pavlo, modified by community. See post 'Timeline' for change history
// Retrieved 2025-12-27, License - CC BY-SA 4.0

/**
 * Checks if a string is a valid HTTP or HTTPS URL.
 * @param string The string to validate.
 * @returns True if the string is a valid HTTP/HTTPS URL, false otherwise.
 */
export function isValidHttpUrl(string: string) {
  let url;

  try {
    url = new URL(string);
  } catch {
    return false;
  }

  return url.protocol === 'http:' || url.protocol === 'https:';
}

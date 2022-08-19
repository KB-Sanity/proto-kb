/* eslint-disable @typescript-eslint/no-unsafe-member-access */
export interface ParsedPluginURLResult {
  parsed: URL;
  isGithub: boolean;
  isDirectFile: boolean;
}

export function parsePluginUrl(url: string): ParsedPluginURLResult {
  const parsedUrl = new URL(url);

  const isGithub = /^(www.)?github.com$/.test(parsedUrl.host);

  return {
    parsed: parsedUrl,
    isGithub,
    isDirectFile: !isGithub && /^(.+)\/([^\\/]+.(js|ts))$/.test(url),
  };
}

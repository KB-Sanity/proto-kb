import type { ApiPlugin } from './interfaces';

export type { ApiPlugin } from './interfaces';
export class HTTPClient {
  static async getPlugins(): Promise<ApiPlugin[]> {
    const res = await fetch(`${import.meta.env.BASE_URL}plugins.json`);
    return res.json() as Promise<ApiPlugin[]>;
  }

  static async fetchGithubPluginPackageFile(owner: string, repo: string): Promise<Record<string, string>> {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/package.json`);
    const packageData = (await res.json()) as Record<string, string>;
    return JSON.parse(atob(packageData.content)) as Record<string, string>;
  }

  static async fetchGithubPluginSourceFile(owner: string, repo: string, path: string): Promise<string> {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`);
    const sourceData = (await res.json()) as Record<string, string>;
    return atob(sourceData.content);
  }

  static async fetchDirectPluginFile(url: string): Promise<string> {
    const res = await fetch(url);
    return res.text();
  }
}

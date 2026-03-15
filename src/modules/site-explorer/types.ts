export interface AccessibilityNode {
  role: string;
  name: string;
  value?: string;
  description?: string;
  children?: AccessibilityNode[];
}

export interface PageInfo {
  url: string;
  depth: number;
  title: string;
  status_code: number | null;
  elements: Record<string, unknown>;
  accessibility_tree: AccessibilityNode | null;
  child_urls: string[];
  screenshot: string;
  error: string | null;
}

export interface SiteMap {
  start_url: string;
  total_pages: number;
  pages: PageInfo[];
}

export interface CrawlOptions {
  onProgress?: (line: string) => void;
  outputDir?: string;
}

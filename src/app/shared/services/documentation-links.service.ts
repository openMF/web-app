import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { DOCUMENTATION_PATHS, DocumentationPage } from '../constants/documentation-links';

const DEFAULT_DOCUMENTATION_BASE_URL = 'https://mifosforge.jira.com/wiki';

@Injectable({
  providedIn: 'root'
})
export class DocumentationLinksService {
  private readonly baseUrl = this.normalizeBaseUrl(environment.documentationBaseUrl || DEFAULT_DOCUMENTATION_BASE_URL);

  /**
   * Build a full documentation URL for the given page key.
   */
  getUrl(page: DocumentationPage): string {
    const path = DOCUMENTATION_PATHS[page];
    if (!path) {
      console.warn(`Unknown documentation page key requested: ${page}`);
      return this.baseUrl;
    }
    return this.buildUrl(path);
  }

  /**
   * Open the documentation URL for the given page key.
   */
  open(page: DocumentationPage, target: string = '_blank'): void {
    const url = this.getUrl(page);
    const windowFeatures = target === '_blank' ? 'noopener' : undefined;
    window.open(url, target, windowFeatures);
  }

  private normalizeBaseUrl(value: string): string {
    return (value || DEFAULT_DOCUMENTATION_BASE_URL).replace(/\/+$/, '');
  }

  private buildUrl(path: string): string {
    if (!path) {
      return this.baseUrl;
    }
    if (/^https?:\/\//i.test(path)) {
      return path;
    }
    const cleanPath = path.replace(/^\/+/, '');
    return `${this.baseUrl}/${cleanPath}`;
  }
}

/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable } from '@angular/core';
import { HttpHeaders, HttpResponse } from '@angular/common/http';

/** Other Imports */
import { each } from 'lodash';

/** Custom Services */
import { Logger } from '../logger/logger.service';

/** Initialize Logger */
const log = new Logger('HttpCacheService');

/** Http Cache Entry Model */
export interface HttpCacheEntry {
  lastUpdated: Date;
  data: HttpResponse<any>;
}

/**
 * Provides a cache facility for HTTP requests with configurable persistence policy.
 */
@Injectable()
export class HttpCacheService {
  /** Key to cache Http Requests in storage. */
  private cachePersistenceStorageKey = 'mifosXHttpCache';

  private cachedData: { [key: string]: HttpCacheEntry } = {};
  private storage: Storage | null = null;

  constructor() {
    this.loadCacheData();
  }

  /**
   * Sets the cache data for the specified request.
   * @param {!string} url The request URL.
   * @param {ResponseOptions} data The received data.
   * @param {Date=} lastUpdated The cache last update, current date is used if not specified.
   */
  setCacheData(url: string, data: HttpResponse<any>, lastUpdated?: Date) {
    this.cachedData[url] = {
      lastUpdated: lastUpdated || new Date(),
      data: data
    };
    log.debug(`Cache set for key: "${url}"`);
    this.saveCacheData();
  }

  /**
   * Gets the cached data for the specified request.
   * @param {!string} url The request URL.
   * @return {?ResponseOptions} The cached data or null if no cached data exists for this request.
   */
  getCacheData(url: string): HttpResponse<any> | null {
    const cacheEntry = this.cachedData[url];

    if (cacheEntry) {
      log.debug(`Cache hit for key: "${url}"`);
      return cacheEntry.data;
    }

    return null;
  }

  /**
   * Gets the cached entry for the specified request.
   * @param {!string} url The request URL.
   * @return {?HttpCacheEntry} The cache entry or null if no cache entry exists for this request.
   */
  getHttpCacheEntry(url: string): HttpCacheEntry | null {
    return this.cachedData[url] || null;
  }

  /**
   * Clears the cached entry (if exists) for the specified request.
   * @param {!string} url The request URL.
   */
  clearCache(url: string): void {
    delete this.cachedData[url];
    log.debug(`Cache cleared for key: "${url}"`);
    this.saveCacheData();
  }

  /**
   * Cleans cache entries older than the specified date.
   * @param {date=} expirationDate The cache expiration date. If no date is specified, all cache is cleared.
   */
  cleanCache(expirationDate?: Date) {
    if (expirationDate) {
      const expirationTime = expirationDate.getTime();
      each(this.cachedData, (value: HttpCacheEntry, key: string) => {
        const lastUpdatedTime = new Date(value.lastUpdated).getTime();
        if (expirationTime >= lastUpdatedTime) {
          delete this.cachedData[key];
        }
      });
      this.saveCacheData();
    } else {
      this.cachedData = {};
      if (this.storage) {
        if (typeof this.storage.removeItem === 'function') {
          this.storage.removeItem(this.cachePersistenceStorageKey);
        } else {
          delete this.storage[this.cachePersistenceStorageKey];
        }
      }
    }
  }

  /**
   * Sets the cache persistence policy.
   * Note that changing the cache persistence will also clear the cache from its previous storage.
   * @param {'local'|'session'=} persistence How the cache should be persisted, it can be either local or session
   *   storage, or if no value is provided it will be only in-memory (default).
   */
  setPersistence(persistence?: 'local' | 'session') {
    this.cleanCache();
    this.storage =
      persistence === 'local' ? window.localStorage : persistence === 'session' ? window.sessionStorage : null;
    this.loadCacheData();
  }

  private saveCacheData() {
    if (this.storage) {
      try {
        const serializedData: { [key: string]: any } = {};
        each(this.cachedData, (entry: HttpCacheEntry, key: string) => {
          const headers: { [name: string]: string[] } = {};
          if (entry.data?.headers && typeof entry.data.headers.keys === 'function') {
            entry.data.headers.keys().forEach((headerKey: string) => {
              const values = entry.data.headers.getAll(headerKey);
              if (values) {
                headers[headerKey] = values;
              }
            });
          }
          serializedData[key] = {
            lastUpdated: entry.lastUpdated,
            data: {
              body: entry.data?.body,
              status: entry.data?.status,
              statusText: entry.data?.statusText,
              url: entry.data?.url,
              headers
            }
          };
        });
        const serializedString = JSON.stringify(serializedData);
        if (typeof this.storage.setItem === 'function') {
          this.storage.setItem(this.cachePersistenceStorageKey, serializedString);
        } else {
          this.storage[this.cachePersistenceStorageKey] = serializedString;
        }
      } catch (error) {
        log.warn(`Failed to save cache to storage: ${error}`);
      }
    }
  }

  private loadCacheData() {
    const data = this.storage
      ? typeof this.storage.getItem === 'function'
        ? this.storage.getItem(this.cachePersistenceStorageKey)
        : this.storage[this.cachePersistenceStorageKey]
      : null;
    this.cachedData = {};
    if (data) {
      try {
        const parsed = JSON.parse(data);
        each(parsed, (entry: any, key: string) => {
          if (!entry || typeof entry !== 'object' || !entry.data || typeof entry.data !== 'object') {
            return;
          }
          if (entry.data.headers && 'normalizedNames' in entry.data.headers) {
            return;
          }
          const lastUpdated = new Date(entry.lastUpdated);
          if (isNaN(lastUpdated.getTime())) {
            return;
          }
          let headers = new HttpHeaders();
          if (entry.data.headers && typeof entry.data.headers === 'object') {
            each(entry.data.headers, (val: any, headerKey: string) => {
              if (typeof val === 'string' || Array.isArray(val)) {
                headers = headers.set(headerKey, val);
              }
            });
          }
          this.cachedData[key] = {
            lastUpdated,
            data: new HttpResponse({
              body: entry.data.body !== undefined ? entry.data.body : null,
              headers,
              status: typeof entry.data.status === 'number' ? entry.data.status : 200,
              statusText: entry.data.statusText || 'OK',
              url: entry.data.url || undefined
            })
          };
        });
      } catch {
        this.cachedData = {};
      }
    }
  }
}

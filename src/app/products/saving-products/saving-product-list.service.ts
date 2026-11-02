/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, from, map, mergeMap, of, switchMap, throwError, toArray } from 'rxjs';
import { ProductsService } from '../products.service';
import {
  MetadataState,
  SavingsProductPolicy,
  SavingsProductRow,
  SavingsProductSummary,
  toSavingsProductRow
} from './saving-product-list.model';

export interface SavingsProductList {
  products: SavingsProductRow[];
  warning: 'unavailable' | 'forbidden' | null;
}

@Injectable({ providedIn: 'root' })
export class SavingProductListService {
  private http = inject(HttpClient);
  private productsService = inject(ProductsService);

  /** Core API returns the complete catalog. BE-01 has no bulk policy endpoint. */
  load(): Observable<SavingsProductList> {
    return this.productsService.getSavingProducts().pipe(
      map((products: unknown) => {
        if (
          !Array.isArray(products) ||
          products.some(
            (product) =>
              !product || !Number.isSafeInteger(product.id) || product.id <= 0 || typeof product.name !== 'string'
          )
        ) {
          throw new Error('Invalid savings product catalog response');
        }
        return products as SavingsProductSummary[];
      }),
      switchMap((products) => {
        if (!products.length) {
          return of({ products: [], warning: null });
        }
        // Probe once: a missing plugin or denied policy read must not trigger one failed call per row.
        return this.http.get<{ classifications: string[] }>('/savingsproducts/policy/template').pipe(
          map((template) => {
            if (!template || !Array.isArray(template.classifications)) {
              throw new Error('Invalid savings policy capabilities response');
            }
          }),
          switchMap(() =>
            from(products).pipe(
              mergeMap(
                (product) =>
                  this.http.get<SavingsProductPolicy>(`/savingsproducts/policy/${product.id}`).pipe(
                    map((configuration) => {
                      // Never attach another product's policy or turn malformed metadata into legacy data.
                      if (
                        !configuration ||
                        configuration.savingsProductId !== product.id ||
                        typeof configuration.operational !== 'boolean' ||
                        typeof configuration.status !== 'string' ||
                        (configuration.status === 'DRAFT' &&
                          (!configuration.policy ||
                            typeof configuration.policy !== 'object' ||
                            typeof configuration.policy.classification !== 'string' ||
                            !configuration.policy.classification.trim())) ||
                        (configuration.status === 'UNCONFIGURED' && configuration.policy != null)
                      ) {
                        throw new Error('Invalid savings product policy response');
                      }
                      return toSavingsProductRow(product, configuration, 'available');
                    }),
                    catchError((error: unknown) => {
                      if (error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403)) {
                        return throwError(() => error);
                      }
                      return of(toSavingsProductRow(product));
                    })
                  ),
                4
              ),
              toArray(),
              map((rows) => {
                const byId = new Map(
                  rows.map((row) => [
                    row.id,
                    row
                  ])
                );
                return {
                  products: products.map((product) => byId.get(product.id)!),
                  warning: rows.some((row) => row.metadataState !== 'available') ? ('unavailable' as const) : null
                };
              })
            )
          ),
          catchError((error: unknown) => {
            const state: MetadataState =
              error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403)
                ? 'forbidden'
                : 'unavailable';
            return of({
              products: products.map((product) => toSavingsProductRow(product, undefined, state)),
              warning: state
            });
          })
        );
      })
    );
  }
}

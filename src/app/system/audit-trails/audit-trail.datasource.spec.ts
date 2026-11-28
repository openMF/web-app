/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Subject, of, throwError } from 'rxjs';
import { AuditTrailsDataSource } from './audit-trail.datasource';
const row = (id = 1, entityName = 'OFFICE') => ({ id, resourceId: 3, entityName });
describe('audit data source request lifecycle', () => {
  it('cancels obsolete pages and clears loading only on completion', () => {
    const first = new Subject<any>();
    const second = new Subject<any>();
    const service = { getAuditTrails: jest.fn().mockReturnValueOnce(first).mockReturnValueOnce(second) };
    const source = new AuditTrailsDataSource(service as any);
    const rows: any[] = [];
    const loading: boolean[] = [];
    source.rows$.subscribe((value) => rows.push(value));
    source.loading$.subscribe((value) => loading.push(value));
    source.getAuditTrails([], 'id', 'desc', 0, 25);
    expect(loading.at(-1)).toBe(true);
    source.getAuditTrails([], 'maker', 'asc', 2, 25);
    expect(first.observed).toBe(false);
    first.next({ pageItems: [row(1)], totalFilteredRecords: 1 });
    second.next({ pageItems: [row(2)], totalFilteredRecords: 60 });
    expect(rows.at(-1)[0].id).toBe('2');
    expect(loading.at(-1)).toBe(false);
    expect(service.getAuditTrails).toHaveBeenLastCalledWith([], 'maker', 'asc', 50, 25);
    source.disconnect();
    expect(second.observed).toBe(false);
  });
  it('clears rows and totals on errors and malformed responses', () => {
    const service = {
      getAuditTrails: jest
        .fn()
        .mockReturnValueOnce(of({}))
        .mockReturnValueOnce(throwError(() => new Error()))
    };
    const source = new AuditTrailsDataSource(service as any);
    let error;
    let count;
    source.error$.subscribe((value) => (error = value));
    source.records$.subscribe((value) => (count = value));
    source.getAuditTrails([]);
    expect(error).toBe(true);
    expect(count).toBe(0);
    source.getAuditTrails([]);
    expect(error).toBe(true);
  });
  it('checks exact resource identity without falsifying prefix-query totals', () => {
    const service = {
      getAuditTrails: jest.fn().mockReturnValue(
        of({ pageItems: [
            row(),
            row(2, 'OFFICETRANSACTION')
          ], totalFilteredRecords: 8 })
      )
    };
    const source = new AuditTrailsDataSource(service as any);
    let rows;
    let count;
    source.rows$.subscribe((value) => (rows = value));
    source.records$.subscribe((value) => (count = value));
    source.getAuditTrails([], 'id', 'desc', 0, 25, { entityName: 'OFFICE', resourceId: '3' });
    expect(rows).toHaveLength(1);
    expect(count).toBe(8);
  });
  it('checks permission again before displaying a response', () => {
    let allowed = true;
    const response = new Subject<any>();
    const source = new AuditTrailsDataSource({ getAuditTrails: () => response } as any, () => allowed);
    let rows;
    source.rows$.subscribe((value) => (rows = value));
    source.getAuditTrails([]);
    allowed = false;
    response.next({ pageItems: [row()], totalFilteredRecords: 1 });
    expect(rows).toEqual([]);
    source.getAuditTrails([]);
    expect(response.observed).toBe(false);
  });
});

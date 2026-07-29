/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { downloadBlob } from './file-download.utils';

describe('downloadBlob', () => {
  const objectUrl = 'blob:report-download';
  let createObjectURLSpy: jest.SpyInstance;
  let revokeObjectURLSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: jest.fn()
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: jest.fn()
    });
    createObjectURLSpy = jest.spyOn(URL, 'createObjectURL').mockReturnValue(objectUrl);
    revokeObjectURLSpy = jest.spyOn(URL, 'revokeObjectURL').mockImplementation();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    createObjectURLSpy.mockRestore();
    revokeObjectURLSpy.mockRestore();
  });

  it('creates and clicks a temporary download link', () => {
    const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation();
    const blob = new Blob(['report'], { type: 'text/plain' });

    downloadBlob(blob, 'client-report.xlsx');

    const link = document.body.querySelector('a[download="client-report.xlsx"]') as HTMLAnchorElement;
    expect(createObjectURLSpy).toHaveBeenCalledWith(blob);
    expect(link).toBeTruthy();
    expect(link.href).toBe(objectUrl);
    expect(link.style.display).toBe('none');
    expect(clickSpy).toHaveBeenCalledTimes(1);

    clickSpy.mockRestore();
  });

  it('removes the temporary link and revokes the object URL', () => {
    const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation();

    downloadBlob(new Blob(['report']), 'client-report.xlsx');

    expect(document.body.querySelector('a[download="client-report.xlsx"]')).toBeTruthy();

    jest.runOnlyPendingTimers();

    expect(document.body.querySelector('a[download="client-report.xlsx"]')).toBeNull();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith(objectUrl);

    clickSpy.mockRestore();
  });
});

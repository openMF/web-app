/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { SystemInformation } from './system-info.service';
import {
  MISSING_VALUE,
  formatDiagnostics,
  formatTimestamp,
  formatUtcOffset,
  isPreRelease,
  orDash,
  parseFineractVersion,
  parseWebAppVersion,
  splitPreRelease
} from './system-info.utils';

/** Actuator info as returned by a Fineract build with the full git information. */
const SNAPSHOT_ACTUATOR_INFO = {
  git: {
    build: { version: '1.17.0-SNAPSHOT' },
    commit: {
      id: {
        abbrev: '12e7559',
        full: '12e7559288b9106accbbdfc0225c2745fef9582f',
        describe: '1.16.1-409-g12e7559-dirty'
      }
    }
  }
};

describe('orDash', () => {
  it('should show a dash for missing or blank values', () => {
    expect(orDash(null)).toBe(MISSING_VALUE);
    expect(orDash(undefined)).toBe(MISSING_VALUE);
    expect(orDash('')).toBe(MISSING_VALUE);
    expect(orDash('   ')).toBe(MISSING_VALUE);
  });

  it('should keep a present value, trimmed', () => {
    expect(orDash(' mifos ')).toBe('mifos');
  });
});

describe('isPreRelease', () => {
  it('should flag SNAPSHOT, RC, alpha and beta builds in any case', () => {
    expect(isPreRelease('1.17.0-SNAPSHOT')).toBe(true);
    expect(isPreRelease('1.17.0-snapshot')).toBe(true);
    expect(isPreRelease('1.17.0-RC1')).toBe(true);
    expect(isPreRelease('1.17.0-rc.2')).toBe(true);
    expect(isPreRelease('2.0.0-alpha')).toBe(true);
    expect(isPreRelease('2.0.0-Alpha3')).toBe(true);
    expect(isPreRelease('2.0.0.beta.2')).toBe(true);
    expect(isPreRelease('1.0.0rc1')).toBe(true);
    expect(isPreRelease('SNAPSHOT')).toBe(true);
  });

  it('should not flag release versions', () => {
    expect(isPreRelease('1.17.0')).toBe(false);
    expect(isPreRelease('261110')).toBe(false);
    expect(isPreRelease('1.12.1-abc1234')).toBe(false);
  });

  it('should not flag a marker that is only part of another word', () => {
    expect(isPreRelease('1.0.0-source')).toBe(false);
    expect(isPreRelease('1.0.0-arc')).toBe(false);
    expect(isPreRelease('1.0.0-betamax')).toBe(false);
  });

  it('should not flag a missing version', () => {
    expect(isPreRelease('')).toBe(false);
    expect(isPreRelease(null)).toBe(false);
    expect(isPreRelease(undefined)).toBe(false);
  });
});

describe('splitPreRelease', () => {
  it('should split the version number from its pre-release marker', () => {
    expect(splitPreRelease('1.17.0-SNAPSHOT')).toEqual({ version: '1.17.0', preRelease: 'SNAPSHOT' });
    expect(splitPreRelease('2.0.0-beta.2')).toEqual({ version: '2.0.0', preRelease: 'beta.2' });
    expect(splitPreRelease('1.0.0rc1')).toEqual({ version: '1.0.0', preRelease: 'rc1' });
  });

  it('should leave a release version whole', () => {
    expect(splitPreRelease('1.17.0')).toEqual({ version: '1.17.0', preRelease: '' });
  });
});

describe('parseFineractVersion', () => {
  it('should read the commit from git.commit.id rather than from the version suffix', () => {
    expect(parseFineractVersion(SNAPSHOT_ACTUATOR_INFO)).toEqual({
      raw: '1.17.0-SNAPSHOT',
      version: '1.17.0',
      preRelease: 'SNAPSHOT',
      hash: '12e7559',
      fullHash: '12e7559288b9106accbbdfc0225c2745fef9582f'
    });
  });

  it('should accept the commit id as a plain string', () => {
    const info = { git: { build: { version: '1.16.1' }, commit: { id: '12e7559' } } };

    expect(parseFineractVersion(info)).toEqual({
      raw: '1.16.1',
      version: '1.16.1',
      preRelease: '',
      hash: '12e7559',
      fullHash: '12e7559'
    });
  });

  it('should read the commit from the version when an older build appends it there', () => {
    const info = { git: { build: { version: '1.12.1-abc1234' } } };

    expect(parseFineractVersion(info)).toEqual({
      raw: '1.12.1-abc1234',
      version: '1.12.1',
      preRelease: '',
      hash: 'abc1234',
      fullHash: 'abc1234'
    });
  });

  it('should never read a pre-release marker as the commit', () => {
    const info = { git: { build: { version: '1.17.0-SNAPSHOT' } } };

    expect(parseFineractVersion(info)).toEqual({
      raw: '1.17.0-SNAPSHOT',
      version: '1.17.0',
      preRelease: 'SNAPSHOT',
      hash: '',
      fullHash: ''
    });
  });

  it('should return empty values when the backend reports no version', () => {
    const empty = { raw: '', version: '', preRelease: '', hash: '', fullHash: '' };

    expect(parseFineractVersion(null)).toEqual(empty);
    expect(parseFineractVersion({})).toEqual(empty);
  });
});

describe('parseWebAppVersion', () => {
  it('should drop the git-describe prefix and abbreviate the hash', () => {
    expect(parseWebAppVersion('261110', 'g5ff9f8385', '5ff9f8385f3c4a4fc1b2e8f9d61a0c07a5f1e2b3')).toEqual({
      raw: '261110',
      version: '261110',
      preRelease: '',
      hash: '5ff9f83',
      fullHash: '5ff9f8385f3c4a4fc1b2e8f9d61a0c07a5f1e2b3'
    });
  });

  it('should fall back to the reported hash when the build did not record the full one', () => {
    expect(parseWebAppVersion('261110', 'g5ff9f8385').fullHash).toBe('5ff9f8385');
  });

  it('should return empty values when the build recorded none', () => {
    expect(parseWebAppVersion(undefined, undefined)).toEqual({
      raw: '',
      version: '',
      preRelease: '',
      hash: '',
      fullHash: ''
    });
  });
});

describe('diagnostics formatting', () => {
  const renderTime = new Date(2026, 10, 10, 23, 38, 27);
  const checkedAt = new Date(2026, 10, 10, 23, 38, 15);
  const userAgent = 'Mozilla/5.0 (X11; Linux x86_64)';

  const systemInformation: SystemInformation = {
    webApp: parseWebAppVersion('261110', 'ged5a603'),
    fineract: parseFineractVersion(SNAPSHOT_ACTUATOR_INFO),
    server: 'https://apis.mifos.community',
    tenant: 'default',
    username: 'mifos',
    name: 'mifos',
    renderTime,
    businessDate: null
  };

  beforeEach(() => {
    jest.spyOn(Date.prototype, 'getTimezoneOffset').mockReturnValue(360);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should format every item on its own line', () => {
    expect(formatDiagnostics(systemInformation, { text: 'Connected', checkedAt }, userAgent)).toBe(
      [
        'Mifos X WebApp: 261110 (ed5a603)',
        'Apache Fineract: 1.17.0-SNAPSHOT (12e7559)',
        'Server: https://apis.mifos.community',
        'Tenant: default',
        'Username: mifos',
        'Name: mifos',
        'Status: Connected (checked 2026-11-10 23:38:15)',
        'Rendered: 2026-11-10 23:38:27 (UTC-06:00)',
        'User agent: Mozilla/5.0 (X11; Linux x86_64)'
      ].join('\n')
    );
  });

  it('should show a dash for every missing value and omit what has no time yet', () => {
    const missing: SystemInformation = {
      webApp: parseWebAppVersion('', ''),
      fineract: parseFineractVersion(null),
      server: '',
      tenant: '',
      username: '',
      name: '',
      renderTime: null,
      businessDate: null
    };

    expect(formatDiagnostics(missing, { text: 'Checking connection…', checkedAt: null }, '')).toBe(
      [
        'Mifos X WebApp: —',
        'Apache Fineract: —',
        'Server: —',
        'Tenant: —',
        'Username: —',
        'Name: —',
        'Status: Checking connection…',
        'Rendered: —',
        'User agent: —'
      ].join('\n')
    );
  });

  it('should format timestamps in the browser time zone with padded fields', () => {
    expect(formatTimestamp(new Date(2026, 0, 5, 7, 8, 9))).toBe('2026-01-05 07:08:09');
  });

  it('should format UTC offsets on both sides of UTC', () => {
    const date = new Date(2026, 10, 10);

    expect(formatUtcOffset(date)).toBe('UTC-06:00');
    jest.spyOn(Date.prototype, 'getTimezoneOffset').mockReturnValue(-330);
    expect(formatUtcOffset(date)).toBe('UTC+05:30');
    jest.spyOn(Date.prototype, 'getTimezoneOffset').mockReturnValue(0);
    expect(formatUtcOffset(date)).toBe('UTC+00:00');
  });
});

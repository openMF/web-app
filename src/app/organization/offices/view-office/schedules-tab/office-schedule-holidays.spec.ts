/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { upcomingOfficeHolidays } from './office-schedule-holidays';

const now = new Date(2026, 10, 17, 12);
const holiday = (id: number, fromDate: unknown, toDate = fromDate, status = 300) => ({
  id,
  name: `Holiday ${id}`,
  fromDate,
  toDate,
  status: { id: status }
});

describe('upcomingOfficeHolidays', () => {
  it('sorts scoped records, retains ongoing ranges and pending activation, excludes deleted, invalid and past records', () => {
    const records = [
      holiday(
        3,
        [
          2026,
          11,
          20
        ]
      ),
      holiday(2, '2026-11-18', '2026-11-19', 100),
      holiday(
        1,
        [
          2026,
          11,
          10
        ],
        [
          2026,
          11,
          17
        ]
      ),
      holiday(
        4,
        [
          2026,
          11,
          16
        ]
      ),
      holiday(
        5,
        [
          2026,
          11,
          18
        ],
        [
          2026,
          11,
          18
        ],
        600
      ),
      holiday(
        6,
        [
          2026,
          11,
          18
        ],
        [
          2026,
          11,
          18
        ],
        0
      ),
      holiday(
        3,
        [
          2026,
          11,
          20
        ]
      )
    ];
    const result = upcomingOfficeHolidays(records, now);
    expect(result.map((record) => record.id)).toEqual([
      1,
      2,
      3
    ]);
    expect(result[0].fromDate).toEqual(new Date(2026, 10, 10));
    expect(result[0].toDate).toEqual(new Date(2026, 10, 17));
    expect(result[1].statusKey).toBe('labels.officeHours.pendingHoliday');
    expect(result[2].statusKey).toBe('labels.status.Active');
    expect(result[2]).not.toHaveProperty('openingTime');
    expect(result[2]).not.toHaveProperty('closed');
  });

  it('uses a 60-day calendar window including today and the next 59 days', () => {
    const result = upcomingOfficeHolidays(
      [
        holiday(1, '2026-11-17'),
        holiday(2, '2027-01-15'),
        holiday(3, '2027-01-16')
      ],
      now
    );
    expect(result.map((record) => record.id)).toEqual([
      1,
      2
    ]);
  });

  it('handles date-only leap days and calendar windows across daylight saving changes', () => {
    expect(
      upcomingOfficeHolidays(
        [
          holiday(
            1,
            [
              2028,
              2,
              29
            ]
          )
        ],
        new Date(2028, 1, 1)
      )
    ).toHaveLength(1);
    expect(upcomingOfficeHolidays([holiday(1, '2026-04-01')], new Date(2026, 2, 1))).toHaveLength(1);
  });

  it.each([
    null,
    {},
    { pageItems: [] },
    [null],
    [holiday(1, '2026-02-30')],
    [
      holiday(
        1,
        [
          2026,
          2,
          29
        ]
      )
    ],
    [holiday(1, '2026-11-18T00:00:00Z')],
    [holiday(1, '2026-11-20', '2026-11-19')],
    [holiday(1, '2026-11-20', '2026-11-20', 999)],
    [{ ...holiday(1, '2026-11-20'), name: '' }]
  ])('distinguishes malformed data %j from a successful empty response', (records) => {
    expect(() => upcomingOfficeHolidays(records, now)).toThrow(TypeError);
  });

  it('accepts a successful empty collection', () => {
    expect(upcomingOfficeHolidays([], now)).toEqual([]);
  });
});

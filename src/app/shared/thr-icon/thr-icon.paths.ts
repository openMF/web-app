/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export type ThrIconNode =
  | { el: 'path'; d: string; fill?: string }
  | { el: 'circle'; cx: string; cy: string; r: string; fill?: string }
  | { el: 'rect'; x: string; y: string; width: string; height: string; rx?: string };

/** Lucide outlines copied from Almost.thr Icon.razor, plus nav/dashboard aliases. */
export const THR_ICONS: Record<string, ThrIconNode[]> = {
  sparkles: [
    {
      el: 'path',
      d: 'M11.017 2.814a1 1 0 0 1 1.966 0l.356 2.08a4 4 0 0 0 3.237 3.237l2.08.356a1 1 0 0 1 0 1.966l-2.08.356a4 4 0 0 0-3.237 3.237l-.356 2.08a1 1 0 0 1-1.966 0l-.356-2.08a4 4 0 0 0-3.237-3.237l-2.08-.356a1 1 0 0 1 0-1.966l2.08-.356a4 4 0 0 0 3.237-3.237z'
    },
    { el: 'path', d: 'M20 2v4' },
    { el: 'path', d: 'M22 4h-4' },
    { el: 'circle', cx: '4', cy: '20', r: '2' }
  ],
  search: [
    { el: 'circle', cx: '11', cy: '11', r: '8' },
    { el: 'path', d: 'm21 21-4.3-4.3' }
  ],
  bell: [
    { el: 'path', d: 'M10.268 21a2 2 0 0 0 3.464 0' },
    {
      el: 'path',
      d: 'M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326'
    }
  ],
  plus: [
    { el: 'path', d: 'M5 12h14' },
    { el: 'path', d: 'M12 5v14' }
  ],
  check: [{ el: 'path', d: 'M20 6 9 17l-5-5' }],
  'chevron-down': [{ el: 'path', d: 'm6 9 6 6 6-6' }],
  'chevron-left': [{ el: 'path', d: 'm15 18-6-6 6-6' }],
  'chevron-right': [{ el: 'path', d: 'm9 18 6-6-6-6' }],
  'layout-dashboard': [
    { el: 'rect', width: '7', height: '9', x: '3', y: '3', rx: '1' },
    { el: 'rect', width: '7', height: '5', x: '14', y: '3', rx: '1' },
    { el: 'rect', width: '7', height: '9', x: '14', y: '12', rx: '1' },
    { el: 'rect', width: '7', height: '5', x: '3', y: '16', rx: '1' }
  ],
  grid: [
    { el: 'rect', width: '18', height: '18', x: '3', y: '3', rx: '2' },
    { el: 'path', d: 'M3 12h18' },
    { el: 'path', d: 'M12 3v18' }
  ],
  x: [
    { el: 'path', d: 'M18 6 6 18' },
    { el: 'path', d: 'm6 6 12 12' }
  ],
  headphones: [
    {
      el: 'path',
      d: 'M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3'
    }
  ],
  'log-out': [
    { el: 'path', d: 'm16 17 5-5-5-5' },
    { el: 'path', d: 'M21 12H9' },
    { el: 'path', d: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' }
  ],
  settings: [
    {
      el: 'path',
      d: 'M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915'
    },
    { el: 'circle', cx: '12', cy: '12', r: '3' }
  ],
  users: [
    { el: 'path', d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' },
    { el: 'circle', cx: '9', cy: '7', r: '4' },
    { el: 'path', d: 'M22 21v-2a4 4 0 0 0-3-3.87' },
    { el: 'path', d: 'M16 3.13a4 4 0 0 1 0 7.75' }
  ],
  file: [
    { el: 'path', d: 'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z' },
    { el: 'path', d: 'M14 2v4a2 2 0 0 0 2 2h4' }
  ],
  wallet: [
    {
      el: 'path',
      d: 'M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1'
    },
    { el: 'path', d: 'M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4' }
  ],
  receipt: [
    { el: 'path', d: 'M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z' },
    { el: 'path', d: 'M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8' },
    { el: 'path', d: 'M12 17.5v-11' }
  ],
  'trending-up': [
    { el: 'path', d: 'M16 7h6v6' },
    { el: 'path', d: 'm22 7-8.5 8.5-5-5L2 17' }
  ],
  'shopping-bag': [
    { el: 'path', d: 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z' },
    { el: 'path', d: 'M3 6h18' },
    { el: 'path', d: 'M16 10a4 4 0 0 1-8 0' }
  ],
  tag: [
    {
      el: 'path',
      d: 'M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.432 0l6.568-6.568a2.426 2.426 0 0 0 0-3.432z'
    },
    { el: 'circle', cx: '7.5', cy: '7.5', r: '.5', fill: 'currentColor' }
  ],
  'rotate-ccw': [
    { el: 'path', d: 'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8' },
    { el: 'path', d: 'M3 3v5h5' }
  ],
  'more-horizontal': [
    { el: 'circle', cx: '12', cy: '12', r: '1' },
    { el: 'circle', cx: '19', cy: '12', r: '1' },
    { el: 'circle', cx: '5', cy: '12', r: '1' }
  ],
  menu: [
    { el: 'path', d: 'M4 5h16' },
    { el: 'path', d: 'M4 12h16' },
    { el: 'path', d: 'M4 19h16' }
  ],
  'credit-card': [
    { el: 'rect', width: '20', height: '14', x: '2', y: '5', rx: '2' },
    { el: 'path', d: 'M2 10h20' }
  ],
  sun: [
    { el: 'circle', cx: '12', cy: '12', r: '4' },
    { el: 'path', d: 'M12 2v2' },
    { el: 'path', d: 'M12 20v2' },
    { el: 'path', d: 'm4.93 4.93 1.41 1.41' },
    { el: 'path', d: 'm17.66 17.66 1.41 1.41' },
    { el: 'path', d: 'M2 12h2' },
    { el: 'path', d: 'M20 12h2' },
    { el: 'path', d: 'm6.34 17.66-1.41 1.41' },
    { el: 'path', d: 'm19.07 4.93-1.41 1.41' }
  ],
  moon: [{ el: 'path', d: 'M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z' }],
  box: [
    {
      el: 'path',
      d: 'M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z'
    },
    { el: 'path', d: 'm3.3 7 8.7 5 8.7-5' },
    { el: 'path', d: 'M12 22V12' }
  ],
  home: [
    { el: 'path', d: 'M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8' },
    {
      el: 'path',
      d: 'M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'
    }
  ],
  user: [
    { el: 'path', d: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' },
    { el: 'circle', cx: '12', cy: '7', r: '4' }
  ],
  building: [
    { el: 'path', d: 'M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z' },
    { el: 'path', d: 'M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2' },
    { el: 'path', d: 'M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2' },
    { el: 'path', d: 'M10 6h4' },
    { el: 'path', d: 'M10 10h4' },
    { el: 'path', d: 'M10 14h4' },
    { el: 'path', d: 'M10 18h4' }
  ],
  briefcase: [
    { el: 'path', d: 'M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16' },
    { el: 'rect', width: '20', height: '14', x: '2', y: '6', rx: '2' }
  ],
  book: [
    { el: 'path', d: 'M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20' }
  ],
  'bar-chart': [
    { el: 'path', d: 'M12 20V10' },
    { el: 'path', d: 'M18 20V4' },
    { el: 'path', d: 'M6 20v-4' }
  ],
  'map-pin': [
    {
      el: 'path',
      d: 'M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0'
    },
    { el: 'circle', cx: '12', cy: '10', r: '3' }
  ],
  'list-checks': [
    { el: 'path', d: 'M13 5h8' },
    { el: 'path', d: 'M13 12h8' },
    { el: 'path', d: 'M13 19h8' },
    { el: 'path', d: 'm3 17 2 2 4-4' },
    { el: 'path', d: 'm3 7 2 2 4-4' }
  ],
  refresh: [
    { el: 'path', d: 'M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8' },
    { el: 'path', d: 'M21 3v5h-5' },
    { el: 'path', d: 'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16' },
    { el: 'path', d: 'M8 16H3v5' }
  ],
  gitfork: [
    { el: 'circle', cx: '12', cy: '18', r: '3' },
    { el: 'circle', cx: '6', cy: '6', r: '3' },
    { el: 'circle', cx: '18', cy: '6', r: '3' },
    { el: 'path', d: 'M18 9v2c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V9' },
    { el: 'path', d: 'M12 12v3' }
  ],
  shield: [
    {
      el: 'path',
      d: 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z'
    }
  ],
  'id-card': [
    { el: 'rect', width: '20', height: '14', x: '2', y: '5', rx: '2' },
    { el: 'circle', cx: '8', cy: '12', r: '2' },
    { el: 'path', d: 'M16 10h2' },
    { el: 'path', d: 'M16 14h2' }
  ],
  'circle-help': [
    { el: 'circle', cx: '12', cy: '12', r: '10' },
    { el: 'path', d: 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3' },
    { el: 'path', d: 'M12 17h.01' }
  ],
  info: [
    { el: 'circle', cx: '12', cy: '12', r: '10' },
    { el: 'path', d: 'M12 16v-4' },
    { el: 'path', d: 'M12 8h.01' }
  ],
  globe: [
    { el: 'circle', cx: '12', cy: '12', r: '10' },
    { el: 'path', d: 'M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20' },
    { el: 'path', d: 'M2 12h20' }
  ],
  'pie-chart': [
    {
      el: 'path',
      d: 'M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z'
    },
    { el: 'path', d: 'M21.21 15.89A10 10 0 1 1 8 2.83' }
  ],
  'user-plus': [
    { el: 'path', d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' },
    { el: 'circle', cx: '9', cy: '7', r: '4' },
    { el: 'path', d: 'M19 8v6' },
    { el: 'path', d: 'M22 11h-6' }
  ],
  download: [
    { el: 'path', d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' },
    { el: 'path', d: 'm7 10 5 5 5-5' },
    { el: 'path', d: 'M12 15V3' }
  ],
  'arrow-up': [
    { el: 'path', d: 'M12 19V5' },
    { el: 'path', d: 'm5 12 7-7 7 7' }
  ],
  'arrow-down': [
    { el: 'path', d: 'M12 5v14' },
    { el: 'path', d: 'm19 12-7 7-7-7' }
  ],
  minus: [{ el: 'path', d: 'M5 12h14' }],
  landmark: [
    { el: 'path', d: 'M3 22h18' },
    { el: 'path', d: 'M6 18v-7' },
    { el: 'path', d: 'M10 18v-7' },
    { el: 'path', d: 'M14 18v-7' },
    { el: 'path', d: 'M18 18v-7' },
    { el: 'path', d: 'M12 2 2 8h20z' }
  ],
  'piggy-bank': [
    {
      el: 'path',
      d: 'M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h6v2h4v-4c1-.5 2-2 2-4.5 0-3.6-2.7-6.2-6-6.5'
    },
    { el: 'path', d: 'M16 8h.01' },
    { el: 'path', d: 'M2 8v3' }
  ],
  calendar: [
    { el: 'path', d: 'M8 2v4' },
    { el: 'path', d: 'M16 2v4' },
    { el: 'rect', width: '18', height: '18', x: '3', y: '4', rx: '2' },
    { el: 'path', d: 'M3 10h18' }
  ],
  archive: [
    { el: 'rect', width: '20', height: '5', x: '2', y: '3', rx: '1' },
    { el: 'path', d: 'M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8' },
    { el: 'path', d: 'M10 12h4' }
  ],
  link: [
    { el: 'path', d: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' },
    { el: 'path', d: 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' }
  ],
  key: [
    { el: 'path', d: 'm15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4' },
    { el: 'path', d: 'm21 2-9.6 9.6' },
    { el: 'circle', cx: '7.5', cy: '15.5', r: '5.5' }
  ],
  clock: [
    { el: 'circle', cx: '12', cy: '12', r: '10' },
    { el: 'path', d: 'M12 6v6l4 2' }
  ],
  lock: [
    { el: 'rect', width: '14', height: '10', x: '5', y: '11', rx: '2' },
    { el: 'path', d: 'M7 11V7a5 5 0 0 1 10 0v4' }
  ]
};

export const THR_ICON_ALIASES: Record<string, string> = {
  bars: 'menu',
  'tachometer-alt': 'layout-dashboard',
  university: 'landmark',
  'money-bill': 'wallet',
  'money-bill-alt': 'wallet',
  'money-bill-wave': 'wallet',
  'chart-bar': 'bar-chart',
  'chart-line': 'trending-up',
  'chart-pie': 'pie-chart',
  'file-alt': 'file',
  'location-arrow': 'map-pin',
  tasks: 'list-checks',
  sync: 'refresh',
  sitemap: 'gitfork',
  'shield-alt': 'shield',
  'user-shield': 'shield',
  'id-badge': 'id-card',
  'address-card': 'id-card',
  cog: 'settings',
  cogs: 'settings',
  'sign-out-alt': 'log-out',
  'question-circle': 'circle-help',
  'info-circle': 'info',
  'fa-check': 'check',
  'fa-tasks': 'list-checks',
  language: 'globe',
  wb_sunny: 'sun',
  nights_stay: 'moon',
  'calendar-alt': 'calendar',
  table: 'grid',
  'list-ul': 'list-checks',
  anchor: 'link',
  road: 'gitfork',
  'fill-drip': 'sun',
  envelope: 'bell',
  'dollar-sign': 'wallet',
  'money-check': 'credit-card',
  'file-word': 'file',
  upload: 'download',
  exchange: 'refresh',
  'user-tie': 'user',
  edit: 'file'
};

export function resolveThrIcon(name?: string | null): string {
  if (!name) {
    return 'sparkles';
  }
  return THR_ICON_ALIASES[name] || name;
}

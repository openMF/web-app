/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Names are shared with the tenant report catalog; database IDs differ between environments. */
export const CLIENT_PDF_REPORTS: ReadonlySet<string> = new Set([
  'Tabla de Amortización Personal back to back',
  'Tabla de Amortización Personal periodo de gracia',
  'Tabla de Amortización Personal simple',
  'Tabla de Amortización PyME CC periodo de gracia',
  'Tabla de Amortización PyME Simple',
  'Factoraje con recurso - Carátula',
  'Factoraje con recurso - Contrato',
  'Factoraje con recurso - Pagaré',
  'Factoraje con recurso - Preceptos legales',
  'Factoraje con recurso - Tabla de amortización'
]);

/** Only these BIRT reports expose DefaultClient and enforce PDF output. */
export function isClientPdfReport(report: { type?: string; name?: string }): boolean {
  return report.type === 'BIRT' && CLIENT_PDF_REPORTS.has(report.name ?? '');
}

/** Backend validation codes that belong to the client field, rather than a technical failure. */
export const CLIENT_REPORT_ERROR_KEYS: Readonly<Record<string, string>> = {
  'error.msg.birt.client.invalid': 'reports.client.invalid',
  'error.msg.birt.client.not.found': 'reports.client.notFound',
  'error.msg.birt.client.no.loans': 'reports.client.noLoans'
};

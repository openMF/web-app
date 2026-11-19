/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export type LoanDocumentCategoryKey =
  'contract' | 'authorization' | 'consultation' | 'evaluation' | 'financial' | 'identity' | 'other';
export interface LoanDocumentCategory {
  key: LoanDocumentCategoryKey;
  codes: readonly string[];
}
/** Whole code tokens only. Specific business codes outrank the generic CARTA token.
 * Multiple specific categories are ambiguous and resolve to Other. MIME types are never categories. */
export const LOAN_DOCUMENT_CATEGORIES: readonly LoanDocumentCategory[] = [
  { key: 'identity', codes: [
      'COMPROBANTE',
      'CONSTANCIA'
    ] },
  { key: 'consultation', codes: [
      'CONSULTA',
      'REPORTE'
    ] },
  { key: 'authorization', codes: ['AUTORIZACION'] },
  { key: 'financial', codes: [
      'CARATULA',
      'ESTADO_CUENTA'
    ] },
  { key: 'evaluation', codes: [
      'RESULTADO',
      'EVALUACION'
    ] },
  { key: 'contract', codes: [
      'FIRMA',
      'FIRMADO',
      'CONTRATO',
      'COMPROMISO'
    ] },
  { key: 'other', codes: [] }
];
/** Display-only dictionary; stored names and filenames are never rewritten. */
export const LOAN_DOCUMENT_TITLES: Readonly<Record<string, string>> = {
  CONTRATO_CREDITO_FIRMADO: 'Contrato de crédito firmado',
  CARTA_COMPROMISO_PAGO: 'Carta compromiso de pago',
  CARTA_COMPROMISO_PAGO_CREDITO: 'Carta compromiso de pago',
  CARTA_AUTORIZACION_REPORTES: 'Carta de autorización de reportes',
  COMPROBANTE_DOMICILIO: 'Comprobante de domicilio',
  REPORTE_CREDITO_ESPECIAL: 'Reporte de crédito especial',
  CONSTANCIA_SITUACION_FISCAL: 'Constancia de situación fiscal',
  CARATULA_ESTADO_CUENTA_BANCARIA: 'Carátula de estado de cuenta',
  CONSULTA_SUSTRAE_FIRA: 'Consulta SUSTRAE FIRA',
  RESULTADO_EVALUACION_CAPACIDAD_PAGO: 'Evaluación de capacidad de pago',
  AUTORIZACION_CREDITO: 'Autorización de crédito'
};

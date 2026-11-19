/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
  LOAN_DOCUMENT_CATEGORIES,
  LOAN_DOCUMENT_TITLES,
  LoanDocumentCategoryKey
} from './loan-document-categories.config';
import { LoanDocumentRequirement, LoanDocumentScheme } from './loan-document-checklist.config';
export interface LoanDocument {
  id: number;
  name?: string;
  fileName?: string;
  description?: string;
  type?: string;
  size?: number;
  issuanceDate?: string | number[];
  expiryDate?: string | number[];
}
export interface PresentedLoanDocument extends LoanDocument {
  title: string;
  number?: number;
  code: string;
  category: LoanDocumentCategoryKey;
  extension: string;
  searchText: string;
}
export type LoanDocumentSort = 'number' | 'name' | 'category';
const CURP = /[A-Z][AEIOUX][A-Z]{2}\d{6}[HM][A-Z]{5}[A-Z\d]\d/gi;
const NUMBERED = /^([A-Z][AEIOUX][A-Z]{2}\d{6}[HM][A-Z]{5}[A-Z\d]\d)-(\d{2})-(.+)$/i;
export function normalizeDocumentText(value: string): string {
  return repairDocumentText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}
export function repairDocumentText(value: string): string {
  const replacements: Record<string, string> = {
    'Ã¡': 'á',
    'Ã©': 'é',
    'Ã­': 'í',
    'Ã³': 'ó',
    Ãº: 'ú',
    'Ã±': 'ñ',
    'Ã¼': 'ü',
    'Ã“': 'Ó',
    'Ã‰': 'É',
    'Ã‘': 'Ñ'
  };
  let result = value.replace(/Ã[¡©­³º±¼“‰‘]/g, (match) => replacements[match] || match);
  result = result.replace(/MIGRACIÃN/gi, 'MIGRACIÓN');
  return result;
}
function stem(value: string): string {
  return value.replace(/\.[a-z\d]{1,8}$/i, '');
}
export function documentCode(value: string): string {
  const base = stem(value);
  const match = base.match(NUMBERED);
  return normalizeDocumentText(match?.[3] || base.replace(CURP, ''))
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}
export function documentNumber(filename: string): number | undefined {
  const match = stem(filename).match(NUMBERED);
  const number = match ? Number(match[2]) : 0;
  return number > 0 ? number : undefined;
}
export function documentTitle(document: LoanDocument): string {
  const name = document.name?.trim() || '';
  // Punctuation is allowed in custom names; only an actual filename or identifier prefix is technical.
  const isStoredFilename = name.toLowerCase() === document.fileName?.trim().toLowerCase();
  if (name && !isStoredFilename && !name.match(CURP) && !name.match(NUMBERED)) {
    return repairDocumentText(name);
  }
  const raw = document.fileName || name;
  const code = documentCode(raw);
  if (LOAN_DOCUMENT_TITLES[code]) return LOAN_DOCUMENT_TITLES[code];
  const cleaned = repairDocumentText(stem(raw).replace(NUMBERED, '$3').replace(CURP, '')).replace(/[_-]+/g, ' ').trim();
  if (!cleaned || !/[\p{L}]/u.test(cleaned)) return '';
  // Keep recognized acronyms while making technical all-caps codes readable.
  if (cleaned === cleaned.toUpperCase()) {
    const acronyms = new Set([
      'PDF',
      'INE',
      'RFC',
      'CURP',
      'FIRA',
      'SUSTRAE',
      'SAT',
      'ID',
      'XLSX'
    ]);
    return cleaned
      .split(/\s+/)
      .map((word, index) =>
        acronyms.has(word)
          ? word
          : index === 0
            ? word[0].toUpperCase() + word.slice(1).toLowerCase()
            : word.toLowerCase()
      )
      .join(' ');
  }
  return cleaned;
}
export function classifyDocument(code: string): LoanDocumentCategoryKey {
  const normalized = '_' + documentCode(code) + '_';
  const matches = LOAN_DOCUMENT_CATEGORIES.filter((category) =>
    category.codes.some((token) => normalized.includes('_' + token + '_'))
  );
  if (matches.length === 1) return matches[0].key;
  if (matches.length > 1) return 'other';
  return normalized.includes('_CARTA_') ? 'authorization' : 'other';
}
export function presentDocument(document: LoanDocument): PresentedLoanDocument {
  const code = documentCode(document.fileName || document.name || '');
  const title = documentTitle(document);
  const mimeExtensions: Record<string, string> = {
    'application/pdf': 'PDF',
    'image/jpeg': 'JPG',
    'image/png': 'PNG',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX'
  };
  return {
    ...document,
    title,
    code,
    number: documentNumber(document.fileName || ''),
    category: classifyDocument(code),
    extension:
      mimeExtensions[document.type?.split(';')[0]] ||
      document.fileName?.match(/\.([a-z\d]{1,8})$/i)?.[1].toUpperCase() ||
      '',
    searchText: normalizeDocumentText(
      [
        title,
        document.name,
        document.fileName,
        document.description
      ]
        .filter(Boolean)
        .join(' ')
    )
  };
}
export function filterDocuments(
  documents: PresentedLoanDocument[],
  query: string,
  category: string,
  sort: LoanDocumentSort
): PresentedLoanDocument[] {
  const search = normalizeDocumentText(query.trim());
  return documents
    .filter((doc) => (!category || doc.category === category) && (!search || doc.searchText.includes(search)))
    .sort((a, b) => {
      const comparison =
        sort === 'number'
          ? (a.number ?? Infinity) - (b.number ?? Infinity)
          : sort === 'name'
            ? a.title.localeCompare(b.title)
            : a.category.localeCompare(b.category);
      return (Number.isNaN(comparison) ? 0 : comparison) || a.id - b.id;
    });
}
export function dossierSlots(scheme: LoanDocumentScheme, documents: PresentedLoanDocument[]) {
  return [...new Set(scheme.numbers)]
    .filter((n) => Number.isInteger(n) && n > 0 && n < 100)
    .map((number) => ({ number, document: documents.find((doc) => doc.number === number) }));
}
export function requirementMet(rule: LoanDocumentRequirement, documents: PresentedLoanDocument[]): boolean {
  return documents.some((doc) =>
    'number' in rule
      ? doc.number === rule.number
      : 'category' in rule
        ? doc.category === rule.category
        : doc.code === documentCode(rule.code)
  );
}
export function documentSize(size?: number): string {
  if (size == null || !Number.isFinite(size) || size < 0) return '—';
  if (size < 1024) return `${size} B`;
  if (size < 1048576) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1048576).toFixed(1)} MB`;
}

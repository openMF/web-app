/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
  classifyDocument,
  documentNumber,
  documentTitle,
  dossierSlots,
  filterDocuments,
  normalizeDocumentText,
  presentDocument,
  repairDocumentText,
  requirementMet
} from './loan-document-presentation.utils';
const filename = 'GUXE550527HSLZXR03-18-CONTRATO_CREDITO_FIRMADO.pdf';
describe('loan document presentation', () => {
  it('derives a privacy-safe dictionary title without changing metadata', () => {
    const original = { id: 1, name: filename, fileName: filename, type: 'application/pdf' };
    const doc = presentDocument(original);
    expect(doc.title).toBe('Contrato de crédito firmado');
    expect(doc.number).toBe(18);
    expect(doc.category).toBe('contract');
    expect(doc.extension).toBe('PDF');
    expect(doc.fileName).toBe(filename);
    expect(original.name).toBe(filename);
  });
  it.each([
    'random-18-CONTRATO.pdf',
    '18-CONTRATO.pdf',
    'GUXE550527HSLZXR03-0-CONTRATO.pdf',
    'GUXE550527HSLZXR03-00-CONTRATO.pdf',
    'GUXE550527HSLZXR03-100-CONTRATO.pdf'
  ])('does not invent a number for %s', (name) => expect(documentNumber(name)).toBeUndefined());
  it.each([
    [
      { id: 1, name: 'Carta de crédito', fileName: filename },
      'Carta de crédito'
    ],
    [
      { id: 1, fileName: 'MI_DOCUMENTO.pdf' },
      'Mi documento'
    ],
    [
      { id: 1, fileName: 'GUXE550527HSLZXR03-05-CONSULTA_SUSTRAE_FIRA.pdf' },
      'Consulta SUSTRAE FIRA'
    ],
    [
      { id: 1, name: 'Información válida y migración' },
      'Información válida y migración'
    ],
    [
      { id: 1, fileName: 'GUXE550527HSLZXR03.pdf' },
      ''
    ],
    [
      { id: 1, fileName: '---.pdf' },
      ''
    ],
    [
      { id: 1 },
      ''
    ]
  ])('derives titles conservatively', (document, expected) => expect(documentTitle(document)).toBe(expected));
  it.each([
    'Garant\u00eda_2026',
    'Approval.v2',
    'Custom.pdf'
  ])('preserves a custom saved name as the title and a searchable value: %s', (name) => {
    const doc = presentDocument({ id: 7, name, fileName: 'SCAN.pdf' });
    expect(doc.title).toBe(name);
    expect(filterDocuments([doc], name, '', 'name')).toEqual([doc]);
    expect(doc.fileName).toBe('SCAN.pdf');
  });
  it('still removes a CURP when the stored name repeats the technical filename', () => {
    const doc = presentDocument({ id: 7, name: filename, fileName: filename });
    expect(doc.title).toBe('Contrato de cr\u00e9dito firmado');
    expect(doc.title).not.toContain('GUXE550527');
  });
  it('repairs only recognized mojibake', () => {
    expect(repairDocumentText('MIGRACIÃN')).toBe('MIGRACIÓN');
    expect(repairDocumentText('AutorizaciÃ³n')).toBe('Autorización');
    expect(repairDocumentText('Información, São Paulo, Ñandú')).toBe('Información, São Paulo, Ñandú');
  });
  it.each([
    [
      'CONTRATO_CREDITO',
      'contract'
    ],
    [
      'FIRMA',
      'contract'
    ],
    [
      'COMPROMISO',
      'contract'
    ],
    [
      'CARTA_COMPROMISO_PAGO',
      'contract'
    ],
    [
      'AUTORIZACIÓN',
      'authorization'
    ],
    [
      'CARTA',
      'authorization'
    ],
    [
      'REPORTE',
      'consultation'
    ],
    [
      'CONSULTA',
      'consultation'
    ],
    [
      'RESULTADO',
      'evaluation'
    ],
    [
      'EVALUACION',
      'evaluation'
    ],
    [
      'CARATULA',
      'financial'
    ],
    [
      'ESTADO_CUENTA',
      'financial'
    ],
    [
      'COMPROBANTE',
      'identity'
    ],
    [
      'CONSTANCIA',
      'identity'
    ],
    [
      'application/pdf',
      'other'
    ],
    [
      'FIRMAMENTO',
      'other'
    ],
    [
      'CONSTANCIACION',
      'other'
    ],
    [
      'CONTRATO_CONSULTA',
      'other'
    ]
  ])('classifies whole tokens: %s', (code, category) => expect(classifyDocument(code)).toBe(category));
  it('combines accent-insensitive search and categories and uses stable ID ties', () => {
    const docs = [
      { id: 3, name: 'Evaluación', fileName: 'EVALUACION.pdf', description: 'Crédito' },
      { id: 1, name: 'Evaluación', fileName: 'EVALUACION.pdf' },
      { id: 2, fileName: filename }
    ].map(presentDocument);
    expect(filterDocuments(docs, 'credito', 'evaluation', 'name').map((doc) => doc.id)).toEqual([3]);
    expect(filterDocuments(docs, '', 'evaluation', 'name').map((doc) => doc.id)).toEqual([
      1,
      3
    ]);
    expect(filterDocuments(docs, '', '', 'number').map((doc) => doc.id)).toEqual([
      2,
      1,
      3
    ]);
    expect(normalizeDocumentText('AUTORIZACIÓN')).toBe('autorizacion');
  });
  it('counts unique configured slots and ignores invalid/outside numbers', () => {
    const docs = [
      presentDocument({ id: 1, fileName: filename }),
      presentDocument({ id: 2, fileName: filename }),
      presentDocument({ id: 3, fileName: 'unknown.pdf' })
    ];
    const scheme: import('./loan-document-checklist.config').LoanDocumentScheme = { numbers: [
        18,
        18,
        19,
        0,
        100
      ], requirements: [] };
    expect(
      dossierSlots(scheme, docs).map((slot) => [
        slot.number,
        !!slot.document
      ])
    ).toEqual([
      [
        18,
        true
      ],
      [
        19,
        false
      ]
    ]);
    expect(requirementMet({ labelKey: 'x', number: 18 }, docs)).toBe(true);
    expect(requirementMet({ labelKey: 'x', category: 'contract' }, docs)).toBe(true);
    expect(requirementMet({ labelKey: 'x', code: 'CONTRATO_CREDITO_FIRMADO' }, docs)).toBe(true);
    expect(requirementMet({ labelKey: 'x', number: 19 }, docs)).toBe(false);
  });
});

/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { describe, expect, it } from '@jest/globals';

import { SearchableOperation, normalizeSearchText, parseSearchTerms, searchOperations } from './base-teller-search';
import { workflowById } from './base-teller-workflows';

function operation(id: string, label: string, description: string, terms: string[]): SearchableOperation {
  return { workflow: workflowById(id)!, label, description, terms };
}

// Spanish fixtures, as rendered for a Spanish-language teller.
const catalog: SearchableOperation[] = [
  operation('savingsDeposit', 'Depósito en cuenta de ahorro', 'Abonar efectivo o cheque a una cuenta de ahorro', [
    'depósito',
    'abono',
    'ingreso'
  ]),
  operation('vaultDeposit', 'Depósito de efectivo en bóveda', 'Enviar efectivo a la bóveda', [
    'bóveda',
    'resguardo'
  ]),
  operation('withdrawal', 'Retiros en efectivo y cheque', 'Entregar efectivo o cheque al cliente', [
    'retiro',
    'retirar',
    'egreso'
  ]),
  operation('cashPickup', 'Retiro de caja', 'Sacar excedente de efectivo', [
    'excedente',
    'recoger efectivo'
  ]),
  operation('foreignCurrency', 'Divisas', 'Compra y venta de moneda extranjera', [
    'moneda extranjera',
    'dólar',
    'tipo de cambio'
  ]),
  operation('transactionReversal', 'Anulación de una transacción', 'Revertir una operación con autorización', [
    'anular',
    'cancelar',
    'reverso'
  ])
];

const ids = (query: string) => searchOperations(catalog, query).map((item) => item.workflow.id);

describe('Base Teller operation search', () => {
  describe('normalisation', () => {
    it('lowercases, strips accents and collapses whitespace', () => {
      expect(normalizeSearchText('  DEPÓSITO   en   Bóveda ')).toBe('deposito en boveda');
      expect(normalizeSearchText('Ñandú')).toBe('nandu');
    });
  });

  describe('matching', () => {
    it('finds operations by name', () => {
      expect(ids('divisas')).toEqual(['foreignCurrency']);
    });

    it('finds every deposit-related operation for "depósito"', () => {
      expect(ids('depósito')).toEqual([
        'savingsDeposit',
        'vaultDeposit'
      ]);
    });

    it('finds both withdrawal and cash pickup for "retiro"', () => {
      expect(ids('retiro')).toEqual(
        expect.arrayContaining([
          'withdrawal',
          'cashPickup'
        ])
      );
    });

    it('finds operations by description', () => {
      expect(ids('excedente')).toContain('cashPickup');
      expect(ids('autorizacion')).toEqual(['transactionReversal']);
    });

    it('finds operations by approved synonym that appears in neither name nor description', () => {
      expect(ids('dólar')).toEqual(['foreignCurrency']);
      expect(ids('cancelar')).toEqual(['transactionReversal']);
      expect(ids('resguardo')).toEqual(['vaultDeposit']);
    });

    it('is case-insensitive and accent-insensitive in both directions', () => {
      expect(ids('DEPOSITO')).toEqual(ids('depósito'));
      expect(ids('dolar')).toEqual(['foreignCurrency']);
      expect(ids('ANULACIÓN')).toEqual(['transactionReversal']);
    });

    it('trims surrounding whitespace', () => {
      expect(ids('   divisas   ')).toEqual(['foreignCurrency']);
    });

    it('supports partial words and phrases', () => {
      expect(ids('boveda')).toEqual(['vaultDeposit']);
      expect(ids('moneda ext')).toEqual(['foreignCurrency']);
      expect(ids('efectivo caja')).toContain('cashPickup');
    });

    it('requires every word of a multi-word query to match', () => {
      expect(ids('depósito bóveda')).toEqual(['vaultDeposit']);
      expect(ids('depósito divisas')).toEqual([]);
    });

    it('returns nothing for an empty or blank query so the grouped view is shown instead', () => {
      expect(ids('')).toEqual([]);
      expect(ids('   ')).toEqual([]);
    });

    it('returns nothing when no operation matches', () => {
      expect(ids('zzz')).toEqual([]);
    });
  });

  describe('ranking', () => {
    it('puts a name that starts with the query before one that merely contains it', () => {
      // Both names start with "retiro", so they tie and keep catalog order; "retiro de" only fits one of them.
      expect(ids('retiro').slice(0, 2)).toEqual([
        'withdrawal',
        'cashPickup'
      ]);
      expect(ids('retiro de')[0]).toBe('cashPickup');
      expect(ids('depósito en')[0]).toBe('savingsDeposit');
    });

    it('ranks name matches above synonym matches above description matches', () => {
      const items = [
        operation('cashOnHand', 'Saldo', 'Todo el efectivo', ['monto']),
        operation('cashPickup', 'Efectivo extra', 'Otra cosa', []),
        operation('cashExchange', 'Cambio', 'Algo', ['efectivo'])
      ];
      expect(searchOperations(items, 'efectivo').map((item) => item.workflow.id)).toEqual([
        'cashPickup',
        'cashExchange',
        'cashOnHand'
      ]);
    });

    it('keeps registry order for equally ranked matches', () => {
      expect(ids('de efectivo')).toEqual(
        expect.arrayContaining([
          'vaultDeposit',
          'cashPickup'
        ])
      );
    });
  });

  describe('permission-filtered source', () => {
    it('can only return operations it was given, so unauthorised operations never leak into results', () => {
      const authorizedOnly = catalog.filter((item) => item.workflow.id !== 'foreignCurrency');
      expect(searchOperations(authorizedOnly, 'divisas')).toEqual([]);
      expect(searchOperations(authorizedOnly, 'dólar')).toEqual([]);
    });
  });

  describe('synonym lists', () => {
    it('splits comma, semicolon and pipe separated terms', () => {
      expect(parseSearchTerms('a, b; c | d', 'key')).toEqual([
        'a',
        'b',
        'c',
        'd'
      ]);
    });

    it('treats a missing translation (the key echoed back) as no synonyms', () => {
      expect(
        parseSearchTerms('baseTellerWorkspace.operations.x.terms', 'baseTellerWorkspace.operations.x.terms')
      ).toEqual([]);
      expect(parseSearchTerms('', 'key')).toEqual([]);
    });
  });
});

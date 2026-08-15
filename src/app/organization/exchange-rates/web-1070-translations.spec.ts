/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const localeFiles = [
  'cs-CS.json',
  'de-DE.json',
  'en-US.json',
  'es-CL.json',
  'es-MX.json',
  'fr-FR.json',
  'it-IT.json',
  'ko-KO.json',
  'lt-LT.json',
  'lv-LV.json',
  'ne-NE.json',
  'pt-PT.json',
  'sw-SW.json'
];

const featureTranslationKeys = [
  'labels.buttons.Create Exchange Rate',
  'labels.buttons.Create Transfer Fee',
  'labels.buttons.Currency Conversion',
  'labels.heading.Create Exchange Rate',
  'labels.heading.Create Transfer Fee',
  'labels.heading.Currency Conversion',
  'labels.heading.Edit Exchange Rate',
  'labels.heading.Edit Transfer Fee',
  'labels.heading.Exchange Rate',
  'labels.heading.Exchange Rates',
  'labels.heading.Transfer Fees',
  'labels.heading.View Exchange Rate',
  'labels.heading.View Transfer Fee',
  'labels.inputs.Administrator',
  'labels.inputs.Amount',
  'labels.inputs.Base Currency',
  'labels.inputs.Buy Indicator',
  'labels.inputs.Buy Rate',
  'labels.inputs.Conversion Date',
  'labels.inputs.Converted Amount',
  'labels.inputs.Cross Rate',
  'labels.inputs.Cross Rate via',
  'labels.inputs.Current BCCR Rate',
  'labels.inputs.Effective Date',
  'labels.inputs.Effective From',
  'labels.inputs.Effective To',
  'labels.inputs.Exchange Rate',
  'labels.inputs.Exchange Rate Required',
  'labels.inputs.Exchange Rate Used',
  'labels.inputs.Fee Currency',
  'labels.inputs.Fee Type',
  'labels.inputs.Fee Value',
  'labels.inputs.Fixed',
  'labels.inputs.Inmediata',
  'labels.inputs.Latest',
  'labels.inputs.PIN',
  'labels.inputs.Provider',
  'labels.inputs.Rate Date',
  'labels.inputs.Rate Source',
  'labels.inputs.Reference Rate',
  'labels.inputs.SINPE Movil',
  'labels.inputs.Sell Indicator',
  'labels.inputs.Sell Rate',
  'labels.inputs.Source Currency',
  'labels.inputs.T+1',
  'labels.inputs.Target Currency',
  'labels.inputs.Threshold Amount',
  'labels.inputs.Threshold Fee',
  'labels.inputs.Transfer Mode',
  'labels.text.Configure self-service transfer fees',
  'labels.text.Create Exchange Rate',
  'labels.text.Create Transfer Fee',
  'labels.text.Currency Conversion',
  'labels.text.Currency conversion failed. Please try again.',
  'labels.text.Edit Exchange Rate',
  'labels.text.Edit Transfer Fee',
  'labels.text.Exchange Rate',
  'labels.text.Exchange Rates',
  'labels.text.Effective To cannot be before Effective From',
  'labels.text.Loading',
  'labels.text.Manage exchange rates and currency conversion',
  'labels.text.No exchange rates found',
  'labels.text.Source and target currencies cannot be identical',
  'labels.text.Transfer Fee Creation',
  'labels.text.Transfer Fee Deletion',
  'labels.text.Transfer Fee Update',
  'labels.text.Transfer Fees',
  'labels.text.Transfer fee created successfully',
  'labels.text.Transfer fee deleted successfully',
  'labels.text.Transfer fee updated successfully',
  'labels.text.View Exchange Rate',
  'labels.text.View Transfer Fee'
];

const localizedExchangeRateInputLabels = new Map<string, string>([
  [
    'cs-CS.json',
    'Směnný kurz'
  ],
  [
    'de-DE.json',
    'Wechselkurs'
  ],
  [
    'es-CL.json',
    'Tipo de cambio'
  ],
  [
    'es-MX.json',
    'Tipo de cambio'
  ],
  [
    'fr-FR.json',
    'Taux de change'
  ],
  [
    'it-IT.json',
    'Tasso di cambio'
  ],
  [
    'ko-KO.json',
    '환율'
  ],
  [
    'lt-LT.json',
    'Valiutos kursas'
  ],
  [
    'lv-LV.json',
    'Valūtas kurss'
  ],
  [
    'ne-NE.json',
    'विनिमय दर'
  ],
  [
    'pt-PT.json',
    'Taxa de câmbio'
  ],
  [
    'sw-SW.json',
    'Kiwango cha ubadilishaji'
  ]
]);

function readTranslations(localeFile: string): Record<string, Record<string, Record<string, string>>> {
  return JSON.parse(readFileSync(join(process.cwd(), 'src/assets/translations', localeFile), 'utf8'));
}

function translationValue(translations: Record<string, Record<string, Record<string, string>>>, key: string): string {
  const [
    root,
    section,
    ...leafParts
  ] = key.split('.');
  return translations[root]?.[section]?.[leafParts.join('.')];
}

describe('WEB-1070 feature translations', () => {
  it.each(localeFiles)('defines Transfer Fees and Exchange Rates keys for %s', (localeFile: string) => {
    const translations = readTranslations(localeFile);

    featureTranslationKeys.forEach((key) => {
      expect(translationValue(translations, key)).toBeTruthy();
    });
  });

  it('defines Spanish labels instead of unresolved keys or English placeholders', () => {
    const spanishTranslations = readTranslations('es-MX.json');

    expect(translationValue(spanishTranslations, 'labels.heading.Transfer Fees')).toBe('Comisiones de transferencia');
    expect(translationValue(spanishTranslations, 'labels.inputs.Fixed')).toBe('Fija');
    expect(translationValue(spanishTranslations, 'labels.inputs.Exchange Rate')).toBe('Tipo de cambio');
    expect(translationValue(spanishTranslations, 'labels.inputs.Rate Date')).toBe('Fecha del tipo de cambio');
    expect(translationValue(spanishTranslations, 'labels.inputs.Buy Indicator')).toBe('Indicador de compra');
    expect(translationValue(spanishTranslations, 'labels.inputs.Sell Rate')).toBe('Tipo de venta');
    expect(translationValue(spanishTranslations, 'labels.text.Exchange Rate')).toBe('Tipo de cambio');
  });

  it.each(Array.from(localizedExchangeRateInputLabels))(
    'localizes Exchange Rate input label for %s',
    (localeFile: string, expectedLabel: string) => {
      const translations = readTranslations(localeFile);

      expect(translationValue(translations, 'labels.inputs.Exchange Rate')).toBe(expectedLabel);
    }
  );
});

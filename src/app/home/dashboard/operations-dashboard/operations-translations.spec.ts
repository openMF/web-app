import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
const directory = join(process.cwd(), 'src/assets/translations');
function flatten(object: Record<string, any>, prefix = ''): Record<string, string> {
  return Object.fromEntries(
    Object.entries(object).flatMap(
      ([
        key,
        value
      ]) => (typeof value === 'string' ? [[
                prefix + key,
                value
              ]] : Object.entries(flatten(value, prefix + key + '.')))
    )
  );
}
const english = flatten(JSON.parse(readFileSync(join(directory, 'en-US.json'), 'utf8')).operations);
describe('Operations localization', () => {
  it.each(readdirSync(directory).filter((file) => file.endsWith('.json')))(
    'has all labels and matching interpolation fields in %s',
    (locale) => {
      const catalog = flatten(JSON.parse(readFileSync(join(directory, locale), 'utf8')).operations);
      expect(Object.keys(catalog).sort()).toEqual(Object.keys(english).sort());
      for (const key of Object.keys(english)) {
        expect(catalog[key].trim()).toBeTruthy();
        expect((catalog[key].match(/{{\w+}}/g) ?? []).sort()).toEqual((english[key].match(/{{\w+}}/g) ?? []).sort());
      }
    }
  );
});

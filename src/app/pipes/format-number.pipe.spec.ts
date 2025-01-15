import { FormatNumberPipe } from './format-number.pipe';

describe('FormatNumberPipe', () => {
  it('create an instance', () => {
    const pipe = new FormatNumberPipe(null, null);
    expect(pipe).toBeTruthy();
  });
});

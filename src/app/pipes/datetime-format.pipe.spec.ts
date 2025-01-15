import { DatetimeFormatPipe } from './datetime-format.pipe';

describe('DatetimeFormatPipe', () => {
  it('create an instance', () => {
    const pipe = new DatetimeFormatPipe(null);
    expect(pipe).toBeTruthy();
  });
});

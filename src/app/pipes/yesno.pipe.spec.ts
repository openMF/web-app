import { YesnoPipe } from './yesno.pipe';

describe('YesnoPipe', () => {
  it('create an instance', () => {
    const pipe = new YesnoPipe();
    expect(pipe).toBeTruthy();
  });
});

import { TranslateService } from '@ngx-translate/core';
import { YesnoPipe } from './yesno.pipe';

describe('YesnoPipe', () => {
  it('create an instance', () => {
    const pipe = new YesnoPipe(null);
    expect(pipe).toBeTruthy();
  });
});

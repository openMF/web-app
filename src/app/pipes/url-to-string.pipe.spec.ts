import { UrlToStringPipe } from './url-to-string.pipe';

describe('UrlToStringPipe', () => {
  it('create an instance', () => {
    const pipe = new UrlToStringPipe();
    expect(pipe).toBeTruthy();
  });
});

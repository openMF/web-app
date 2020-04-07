import { SharesModule } from './shares.module';

describe('SharesModule', () => {
  let sharesModule: SharesModule;

  beforeEach(() => {
    sharesModule = new SharesModule();
  });

  it('should create an instance', () => {
    expect(sharesModule).toBeTruthy();
  });
});

import { SelfServiceModule } from './self-service.module';

describe('SelfServiceModule', () => {
  let selfServiceModule: SelfServiceModule;

  beforeEach(() => {
    selfServiceModule = new SelfServiceModule();
  });

  it('should create an instance', () => {
    expect(selfServiceModule).toBeTruthy();
  });
});

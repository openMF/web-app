import { SystemModule } from './system.module';

describe('SystemModule', () => {
  let systemModule: SystemModule;

  beforeEach(() => {
    systemModule = new SystemModule();
  });

  it('should create an instance', () => {
    expect(systemModule).toBeTruthy();
  });
});

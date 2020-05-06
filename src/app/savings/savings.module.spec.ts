import { SavingsModule } from './savings.module';

describe('SavingsModule', () => {
  let savingsModule: SavingsModule;

  beforeEach(() => {
    savingsModule = new SavingsModule();
  });

  it('should create an instance', () => {
    expect(savingsModule).toBeTruthy();
  });
});

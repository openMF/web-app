import { LoansModule } from './loans.module';

describe('LoansModule', () => {
  let loansModule: LoansModule;

  beforeEach(() => {
    loansModule = new LoansModule();
  });

  it('should create an instance', () => {
    expect(loansModule).toBeTruthy();
  });
});

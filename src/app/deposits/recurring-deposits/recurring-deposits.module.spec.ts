import { RecurringDepositsModule } from './recurring-deposits.module';

describe('RecurringDepositsModule', () => {
  let recurringDepositsModule: RecurringDepositsModule;

  beforeEach(() => {
    recurringDepositsModule = new RecurringDepositsModule();
  });

  it('should create an instance', () => {
    expect(recurringDepositsModule).toBeTruthy();
  });
});

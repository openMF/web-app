import { LoansRoutingModule } from './loans-routing.module';

describe('LoansRoutingModule', () => {
  let loansRoutingModule: LoansRoutingModule;

  beforeEach(() => {
    loansRoutingModule = new LoansRoutingModule();
  });

  it('should create an instance', () => {
    expect(loansRoutingModule).toBeTruthy();
  });
});

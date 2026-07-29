import { of } from 'rxjs';
import { UntypedFormBuilder } from '@angular/forms';

import { LoanProductAllocationComponent } from './loan-product-allocation.component';

describe('LoanProductAllocationComponent', () => {
  const createComponent = (overrides: any = {}) => {
    const productService = {
      getAllocationTemplate: jasmine.createSpy().and.returnValue(of({ countryOptions: [], loanTypeOptions: [] })),
      updateLoanAllocationProduct: jasmine.createSpy().and.returnValue(of({})),
      createLoanAllocationProduct: jasmine.createSpy().and.returnValue(of({})),
    };
    const organizationService = {
      searchCountryById: jasmine.createSpy().and.returnValue(of([])),
    };
    const router = {
      url: '/products/loan-product-allocation/edit',
      navigate: jasmine.createSpy(),
    };
    const route = {
      data: of({
        loanProductAllocationData: {
          id: 42,
          districtOffice: { name: 'Nairobi' },
          loanPaymentAllocationSetting: {
            id: 7,
            repaymentChoice: 'SYSTEM_CHOICE',
            systemChoice: 'DUE_DATE',
            liabilityPriority: '',
            disbursementDateOrder: null,
            loanTypeOptions: [],
          },
        },
      }),
    };
    const component = new LoanProductAllocationComponent(
      productService as any,
      organizationService as any,
      router as any,
      route as any,
      new UntypedFormBuilder(),
      {} as any
    );

    Object.assign(component, overrides);
    component.ngOnInit();

    return { component, productService, router };
  };

  it('should create', () => {
    const { component } = createComponent();

    expect(component).toBeTruthy();
  });

  it('should require disbursement date order only for disbursement date system choice', () => {
    const { component } = createComponent();
    const disbursementDateOrderControl = component.allocationForm.get('disbursementDateOrder');

    expect(disbursementDateOrderControl?.hasError('required')).toBeFalse();

    component.allocationForm.get('systemChoice')?.setValue('DISBURSEMENT_DATE');
    disbursementDateOrderControl?.setValue(null);

    expect(disbursementDateOrderControl?.hasError('required')).toBeTrue();

    component.allocationForm.get('systemChoice')?.setValue('DUE_DATE');

    expect(disbursementDateOrderControl?.hasError('required')).toBeFalse();
  });

  it('should not require disbursement date order for client choice', () => {
    const { component } = createComponent();
    const disbursementDateOrderControl = component.allocationForm.get('disbursementDateOrder');

    component.allocationForm.get('systemChoice')?.setValue('DISBURSEMENT_DATE');
    component.allocationForm.get('repaymentChoice')?.setValue('CLIENT_CHOICE');
    disbursementDateOrderControl?.setValue(null);

    expect(disbursementDateOrderControl?.hasError('required')).toBeFalse();
  });

  it('should reject invalid forms before building the payload', () => {
    const { component, productService } = createComponent();
    spyOn(component, 'getLoanAllocationProduct').and.callThrough();

    component.allocationForm.get('systemChoice')?.setValue('DISBURSEMENT_DATE');
    component.allocationForm.get('disbursementDateOrder')?.setValue(null);

    component.submit();

    expect(component.getLoanAllocationProduct).not.toHaveBeenCalled();
    expect(productService.updateLoanAllocationProduct).not.toHaveBeenCalled();
  });
});

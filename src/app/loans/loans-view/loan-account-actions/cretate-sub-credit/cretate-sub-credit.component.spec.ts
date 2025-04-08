import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CretateSubCreditComponent } from './cretate-sub-credit.component';

describe('CretateSubCreditComponent', () => {
  let component: CretateSubCreditComponent;
  let fixture: ComponentFixture<CretateSubCreditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CretateSubCreditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CretateSubCreditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

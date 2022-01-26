import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditLoansAccountComponent } from './edit-loans-account.component';

describe('EditLoansAccountComponent', () => {
  let component: EditLoansAccountComponent;
  let fixture: ComponentFixture<EditLoansAccountComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditLoansAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditLoansAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

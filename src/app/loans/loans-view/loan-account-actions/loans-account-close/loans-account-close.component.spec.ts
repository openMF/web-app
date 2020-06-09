import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoansAccountCloseComponent } from './loans-account-close.component';

describe('LoansAccountCloseComponent', () => {
  let component: LoansAccountCloseComponent;
  let fixture: ComponentFixture<LoansAccountCloseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoansAccountCloseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoansAccountCloseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

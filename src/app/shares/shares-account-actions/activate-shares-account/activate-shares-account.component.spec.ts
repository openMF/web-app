import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivateSharesAccountComponent } from './activate-shares-account.component';

describe('ActivateSharesAccountComponent', () => {
  let component: ActivateSharesAccountComponent;
  let fixture: ComponentFixture<ActivateSharesAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivateSharesAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivateSharesAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingsAccountTableComponent } from './savings-account-table.component';

describe('SavingsAccountTableComponent', () => {
  let component: SavingsAccountTableComponent;
  let fixture: ComponentFixture<SavingsAccountTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SavingsAccountTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SavingsAccountTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

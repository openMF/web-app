import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ChartOfAccountsComponent } from './chart-of-accounts.component';

describe('ChartOfAccountsComponent', () => {
  let component: ChartOfAccountsComponent;
  let fixture: ComponentFixture<ChartOfAccountsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartOfAccountsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartOfAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCashierComponent } from './view-cashier.component';

describe('ViewCashierComponent', () => {
  let component: ViewCashierComponent;
  let fixture: ComponentFixture<ViewCashierComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewCashierComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewCashierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

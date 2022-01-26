import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WaiveChargeDialogComponent } from './waive-charge-dialog.component';

describe('WaiveChargeDialogComponent', () => {
  let component: WaiveChargeDialogComponent;
  let fixture: ComponentFixture<WaiveChargeDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WaiveChargeDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WaiveChargeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

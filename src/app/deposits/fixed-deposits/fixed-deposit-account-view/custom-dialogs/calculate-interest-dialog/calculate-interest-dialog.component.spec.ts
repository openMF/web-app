import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CalculateInterestDialogComponent } from './calculate-interest-dialog.component';

describe('CalculateInterestDialogComponent', () => {
  let component: CalculateInterestDialogComponent;
  let fixture: ComponentFixture<CalculateInterestDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CalculateInterestDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalculateInterestDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

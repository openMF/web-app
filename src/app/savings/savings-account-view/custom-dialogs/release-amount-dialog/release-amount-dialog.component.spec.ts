import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReleaseAmountDialogComponent } from './release-amount-dialog.component';

describe('ReleaseAmountDialogComponent', () => {
  let component: ReleaseAmountDialogComponent;
  let fixture: ComponentFixture<ReleaseAmountDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReleaseAmountDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReleaseAmountDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

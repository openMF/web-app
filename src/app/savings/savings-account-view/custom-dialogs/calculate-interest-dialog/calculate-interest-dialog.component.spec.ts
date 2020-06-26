import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculateInterestDialogComponent } from './calculate-interest-dialog.component';

describe('CalculateInterestDialogComponent', () => {
  let component: CalculateInterestDialogComponent;
  let fixture: ComponentFixture<CalculateInterestDialogComponent>;

  beforeEach(async(() => {
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

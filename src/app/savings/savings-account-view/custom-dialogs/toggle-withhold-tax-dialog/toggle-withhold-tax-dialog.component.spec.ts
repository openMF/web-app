import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ToggleWithholdTaxDialogComponent } from './toggle-withhold-tax-dialog.component';

describe('ToggleWithholdTaxDialogComponent', () => {
  let component: ToggleWithholdTaxDialogComponent;
  let fixture: ComponentFixture<ToggleWithholdTaxDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ToggleWithholdTaxDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToggleWithholdTaxDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

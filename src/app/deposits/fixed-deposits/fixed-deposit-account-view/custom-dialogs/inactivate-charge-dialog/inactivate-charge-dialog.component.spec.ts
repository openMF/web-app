import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InactivateChargeDialogComponent } from './inactivate-charge-dialog.component';

describe('InactivateChargeDialogComponent', () => {
  let component: InactivateChargeDialogComponent;
  let fixture: ComponentFixture<InactivateChargeDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InactivateChargeDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InactivateChargeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

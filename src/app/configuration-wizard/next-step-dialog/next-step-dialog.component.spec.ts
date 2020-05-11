import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NextStepDialogComponent } from './next-step-dialog.component';

describe('NextStepDialogComponent', () => {
  let component: NextStepDialogComponent;
  let fixture: ComponentFixture<NextStepDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NextStepDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NextStepDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

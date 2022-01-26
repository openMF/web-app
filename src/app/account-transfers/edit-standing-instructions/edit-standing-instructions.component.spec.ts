import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditStandingInstructionsComponent } from './edit-standing-instructions.component';

describe('EditStandingInstructionsComponent', () => {
  let component: EditStandingInstructionsComponent;
  let fixture: ComponentFixture<EditStandingInstructionsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditStandingInstructionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditStandingInstructionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

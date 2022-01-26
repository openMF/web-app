import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CreateStandingInstructionsComponent } from './create-standing-instructions.component';

describe('CreateStandingInstructionsComponent', () => {
  let component: CreateStandingInstructionsComponent;
  let fixture: ComponentFixture<CreateStandingInstructionsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateStandingInstructionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateStandingInstructionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

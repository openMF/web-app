import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateStandingInstructionsComponent } from './create-standing-instructions.component';

describe('CreateStandingInstructionsComponent', () => {
  let component: CreateStandingInstructionsComponent;
  let fixture: ComponentFixture<CreateStandingInstructionsComponent>;

  beforeEach(async(() => {
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

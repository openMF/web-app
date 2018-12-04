import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateStandingInstructionComponent } from './create-standing-instruction.component';

describe('CreateStandingInstructionComponent', () => {
  let component: CreateStandingInstructionComponent;
  let fixture: ComponentFixture<CreateStandingInstructionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateStandingInstructionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateStandingInstructionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

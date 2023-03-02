import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CobWorkflowComponent } from './cob-workflow.component';

describe('CobWorkflowComponent', () => {
  let component: CobWorkflowComponent;
  let fixture: ComponentFixture<CobWorkflowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CobWorkflowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CobWorkflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

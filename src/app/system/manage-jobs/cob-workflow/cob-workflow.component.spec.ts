import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CobWorkflowComponent } from './cob-workflow.component';
import { HttpClientModule } from '@angular/common/http';

describe('CobWorkflowComponent', () => {
  let component: CobWorkflowComponent;
  let fixture: ComponentFixture<CobWorkflowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CobWorkflowComponent],
      imports: [HttpClientModule]
    }).compileComponents();
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

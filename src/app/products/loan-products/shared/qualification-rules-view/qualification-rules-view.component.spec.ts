import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QualificationRulesViewComponent } from './qualification-rules-view.component';

describe('QualificationRulesViewComponent', () => {
  let component: QualificationRulesViewComponent;
  let fixture: ComponentFixture<QualificationRulesViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QualificationRulesViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QualificationRulesViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

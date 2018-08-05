import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRuleComponent } from './edit-rule.component';

describe('EditRuleComponent', () => {
  let component: EditRuleComponent;
  let fixture: ComponentFixture<EditRuleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditRuleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditRuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

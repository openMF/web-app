import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditTemplateComponent } from './edit-template.component';

describe('EditTemplateComponent', () => {
  let component: EditTemplateComponent;
  let fixture: ComponentFixture<EditTemplateComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

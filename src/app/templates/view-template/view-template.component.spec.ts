import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ViewTemplateComponent } from './view-template.component';

describe('ViewTemplateComponent', () => {
  let component: ViewTemplateComponent;
  let fixture: ComponentFixture<ViewTemplateComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

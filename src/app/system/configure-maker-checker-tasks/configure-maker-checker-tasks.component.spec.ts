import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ConfigureMakerCheckerTasksComponent } from './configure-maker-checker-tasks.component';

describe('ConfigureMakerCheckerTasksComponent', () => {
  let component: ConfigureMakerCheckerTasksComponent;
  let fixture: ComponentFixture<ConfigureMakerCheckerTasksComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigureMakerCheckerTasksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigureMakerCheckerTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

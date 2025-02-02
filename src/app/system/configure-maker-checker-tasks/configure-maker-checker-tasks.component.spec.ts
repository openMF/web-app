import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigureMakerCheckerTasksComponent } from './configure-maker-checker-tasks.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('ConfigureMakerCheckerTasksComponent', () => {
  let component: ConfigureMakerCheckerTasksComponent;
  let fixture: ComponentFixture<ConfigureMakerCheckerTasksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ConfigureMakerCheckerTasksComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' }) // Proporciona los parámetros necesarios para ActivatedRoute
          }
        }
      ]
    }).compileComponents();
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

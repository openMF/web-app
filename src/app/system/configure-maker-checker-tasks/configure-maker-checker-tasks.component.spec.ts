import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigureMakerCheckerTasksComponent } from './configure-maker-checker-tasks.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay';

describe('ConfigureMakerCheckerTasksComponent', () => {
  let component: ConfigureMakerCheckerTasksComponent;
  let fixture: ComponentFixture<ConfigureMakerCheckerTasksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ConfigureMakerCheckerTasksComponent],
      imports: [
        HttpClientModule,
        RouterTestingModule,
        ReactiveFormsModule,
        OverlayModule
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' })
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

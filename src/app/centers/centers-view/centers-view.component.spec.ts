import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CentersViewComponent } from './centers-view.component';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';

describe('CentersViewComponent', () => {
  let component: CentersViewComponent;
  let fixture: ComponentFixture<CentersViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CentersViewComponent],
      imports: [
        MatDialogModule,
        RouterTestingModule
      ],
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
    fixture = TestBed.createComponent(CentersViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

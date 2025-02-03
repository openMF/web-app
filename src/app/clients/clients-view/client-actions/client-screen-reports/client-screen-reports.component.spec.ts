import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientScreenReportsComponent } from './client-screen-reports.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('ClientScreenReportsComponent', () => {
  let component: ClientScreenReportsComponent;
  let fixture: ComponentFixture<ClientScreenReportsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ClientScreenReportsComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule
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
    fixture = TestBed.createComponent(ClientScreenReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

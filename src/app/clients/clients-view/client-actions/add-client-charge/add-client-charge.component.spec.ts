import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddClientChargeComponent } from './add-client-charge.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('AddClientChargeComponent', () => {
  let component: AddClientChargeComponent;
  let fixture: ComponentFixture<AddClientChargeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddClientChargeComponent],
      imports: [ReactiveFormsModule],
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
    fixture = TestBed.createComponent(AddClientChargeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

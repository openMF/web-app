import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateGsimAccountComponent } from './create-gsim-account.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';

describe('CreateGsimAccountComponent', () => {
  let component: CreateGsimAccountComponent;
  let fixture: ComponentFixture<CreateGsimAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateGsimAccountComponent],
      imports: [CommonModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ savingsAccountTemplate: 'any', groupsData: 'any' })
          }
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateGsimAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSavingsAccountComponent } from './edit-savings-account.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

describe('EditSavingsAccountComponent', () => {
  let component: EditSavingsAccountComponent;
  let fixture: ComponentFixture<EditSavingsAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditSavingsAccountComponent],
      imports: [
        RouterTestingModule,
        HttpClientModule,
        CommonModule
      ],
      providers: [
        DatePipe,
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
    fixture = TestBed.createComponent(EditSavingsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

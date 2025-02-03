import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditHookComponent } from './edit-hook.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

describe('EditHookComponent', () => {
  let component: EditHookComponent;
  let fixture: ComponentFixture<EditHookComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditHookComponent],
      imports: [
        RouterTestingModule,
        HttpClientModule,
        ReactiveFormsModule
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
    fixture = TestBed.createComponent(EditHookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageHooksComponent } from './manage-hooks.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

describe('ManageHooksComponent', () => {
  let component: ManageHooksComponent;
  let fixture: ComponentFixture<ManageHooksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ManageHooksComponent],
      imports: [RouterTestingModule],
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
    fixture = TestBed.createComponent(ManageHooksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

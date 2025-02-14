import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargesComponent } from './charges.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { OverlayModule } from '@angular/cdk/overlay';

describe('ChargesComponent', () => {
  let component: ChargesComponent;
  let fixture: ComponentFixture<ChargesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ChargesComponent],
      imports: [
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
    fixture = TestBed.createComponent(ChargesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

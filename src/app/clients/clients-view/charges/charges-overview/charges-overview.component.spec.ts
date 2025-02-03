import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargesOverviewComponent } from './charges-overview.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('ChargesOverviewComponent', () => {
  let component: ChargesOverviewComponent;
  let fixture: ComponentFixture<ChargesOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ChargesOverviewComponent],
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
    fixture = TestBed.createComponent(ChargesOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

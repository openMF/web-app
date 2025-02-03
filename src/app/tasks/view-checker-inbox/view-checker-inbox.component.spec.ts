import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCheckerInboxComponent } from './view-checker-inbox.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

describe('ViewCheckerInboxComponent', () => {
  let component: ViewCheckerInboxComponent;
  let fixture: ComponentFixture<ViewCheckerInboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewCheckerInboxComponent],
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
    fixture = TestBed.createComponent(ViewCheckerInboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

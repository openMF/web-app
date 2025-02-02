import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { XBRLComponent } from './xbrl.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('XBRLComponent', () => {
  let component: XBRLComponent;
  let fixture: ComponentFixture<XBRLComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [XBRLComponent],
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
    fixture = TestBed.createComponent(XBRLComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

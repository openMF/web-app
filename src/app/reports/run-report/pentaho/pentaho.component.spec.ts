import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PentahoComponent } from './pentaho.component';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';

describe('PentahoComponent', () => {
  let component: PentahoComponent;
  let fixture: ComponentFixture<PentahoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PentahoComponent],
      imports: [
        HttpClientModule,
        MatProgressBarModule
      ],
      providers: [DatePipe]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PentahoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

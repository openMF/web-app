import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WaiveInterestComponent } from './waive-interest.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

describe('WaiveInterestComponent', () => {
  let component: WaiveInterestComponent;
  let fixture: ComponentFixture<WaiveInterestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WaiveInterestComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule
      ],
      providers: [DatePipe]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WaiveInterestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CloseSharesAccountComponent } from './close-shares-account.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';

describe('CloseSharesAccountComponent', () => {
  let component: CloseSharesAccountComponent;
  let fixture: ComponentFixture<CloseSharesAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CloseSharesAccountComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        RouterTestingModule
      ],
      providers: [DatePipe]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CloseSharesAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoansAccountCloseComponent } from './loans-account-close.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';

describe('LoansAccountCloseComponent', () => {
  let component: LoansAccountCloseComponent;
  let fixture: ComponentFixture<LoansAccountCloseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LoansAccountCloseComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule
      ],
      providers: [DatePipe]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoansAccountCloseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

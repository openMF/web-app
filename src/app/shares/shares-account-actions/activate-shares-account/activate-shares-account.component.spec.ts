import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivateSharesAccountComponent } from './activate-shares-account.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';

describe('ActivateSharesAccountComponent', () => {
  let component: ActivateSharesAccountComponent;
  let fixture: ComponentFixture<ActivateSharesAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ActivateSharesAccountComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        RouterTestingModule
      ],
      providers: [DatePipe]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivateSharesAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

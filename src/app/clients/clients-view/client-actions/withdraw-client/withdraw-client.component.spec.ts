import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WithdrawClientComponent } from './withdraw-client.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';

describe('WithdrawClientComponent', () => {
  let component: WithdrawClientComponent;
  let fixture: ComponentFixture<WithdrawClientComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WithdrawClientComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        RouterTestingModule
      ],
      providers: [DatePipe]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WithdrawClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

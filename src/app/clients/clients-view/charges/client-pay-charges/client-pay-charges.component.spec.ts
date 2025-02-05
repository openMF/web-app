import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientPayChargesComponent } from './client-pay-charges.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { DatePipe } from '@angular/common';

describe('ClientPayChargesComponent', () => {
  let component: ClientPayChargesComponent;
  let fixture: ComponentFixture<ClientPayChargesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ClientPayChargesComponent],
      imports: [
        HttpClientModule,
        ReactiveFormsModule,
        RouterTestingModule
      ],
      providers: [
        DatePipe
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientPayChargesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

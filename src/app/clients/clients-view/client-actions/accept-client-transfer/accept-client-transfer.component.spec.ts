import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AcceptClientTransferComponent } from './accept-client-transfer.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';

describe('AcceptClientTransferComponent', () => {
  let component: AcceptClientTransferComponent;
  let fixture: ComponentFixture<AcceptClientTransferComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AcceptClientTransferComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule
      ],
      providers: [
        DatePipe
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AcceptClientTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

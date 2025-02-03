import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferClientComponent } from './transfer-client.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';

describe('TransferClientComponent', () => {
  let component: TransferClientComponent;
  let fixture: ComponentFixture<TransferClientComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TransferClientComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        RouterTestingModule,
        CommonModule
      ],
      providers: [DatePipe]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransferClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

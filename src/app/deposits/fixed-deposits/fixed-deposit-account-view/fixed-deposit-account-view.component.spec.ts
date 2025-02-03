import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedDepositAccountViewComponent } from './fixed-deposit-account-view.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

describe('FixedDepositAccountViewComponent', () => {
  let component: FixedDepositAccountViewComponent;
  let fixture: ComponentFixture<FixedDepositAccountViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FixedDepositAccountViewComponent],
      imports: [
        RouterTestingModule,
        HttpClientModule,
        MatDialogModule
      ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: {
            close: () => {}
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixedDepositAccountViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

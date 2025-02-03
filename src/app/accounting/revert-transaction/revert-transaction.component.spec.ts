import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RevertTransactionComponent } from './revert-transaction.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';

describe('RevertTransactionComponent', () => {
  let component: RevertTransactionComponent;
  let fixture: ComponentFixture<RevertTransactionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RevertTransactionComponent],
      imports: [
        MatDialogModule,
        ReactiveFormsModule,
        HttpClientModule,
        RouterTestingModule,
        CommonModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RevertTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

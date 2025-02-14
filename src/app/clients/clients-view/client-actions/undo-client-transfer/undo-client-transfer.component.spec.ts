import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UndoClientTransferComponent } from './undo-client-transfer.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';

describe('UndoClientTransferComponent', () => {
  let component: UndoClientTransferComponent;
  let fixture: ComponentFixture<UndoClientTransferComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UndoClientTransferComponent],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientModule
      ],
      providers: [DatePipe]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UndoClientTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

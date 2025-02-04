import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UndoClientRejectionComponent } from './undo-client-rejection.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';

describe('UndoClientRejectionComponent', () => {
  let component: UndoClientRejectionComponent;
  let fixture: ComponentFixture<UndoClientRejectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UndoClientRejectionComponent],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientModule
      ],
      providers: [DatePipe]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UndoClientRejectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTransactionComponent } from './edit-transaction.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

describe('EditTransactionComponent', () => {
  let component: EditTransactionComponent;
  let fixture: ComponentFixture<EditTransactionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditTransactionComponent],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditLoansAccountComponent } from './edit-loans-account.component';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';

describe('EditLoansAccountComponent', () => {
  let component: EditLoansAccountComponent;
  let fixture: ComponentFixture<EditLoansAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditLoansAccountComponent],
      imports: [
        RouterTestingModule,
        CommonModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditLoansAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisburseToSavingsAccountComponent } from './disburse-to-savings-account.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

describe('DisburseToSavingsAccountComponent', () => {
  let component: DisburseToSavingsAccountComponent;
  let fixture: ComponentFixture<DisburseToSavingsAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DisburseToSavingsAccountComponent],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DisburseToSavingsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivateSavingsAccountComponent } from './activate-savings-account.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

describe('ActivateSavingsAccountComponent', () => {
  let component: ActivateSavingsAccountComponent;
  let fixture: ComponentFixture<ActivateSavingsAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ActivateSavingsAccountComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivateSavingsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

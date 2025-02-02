import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSavingsAccountComponent } from './create-savings-account.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('CreateSavingsAccountComponent', () => {
  let component: CreateSavingsAccountComponent;
  let fixture: ComponentFixture<CreateSavingsAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateSavingsAccountComponent],
      imports: [RouterTestingModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateSavingsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

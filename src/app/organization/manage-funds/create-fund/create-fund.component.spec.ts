import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateFundComponent } from './create-fund.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

describe('CreateFundComponent', () => {
  let component: CreateFundComponent;
  let fixture: ComponentFixture<CreateFundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateFundComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateFundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCurrenciesComponent } from './create-currencies.component';

describe('CreateCurrenciesComponent', () => {
  let component: CreateCurrenciesComponent;
  let fixture: ComponentFixture<CreateCurrenciesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateCurrenciesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateCurrenciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

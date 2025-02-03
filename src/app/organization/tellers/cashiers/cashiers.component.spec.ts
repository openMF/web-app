import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CashiersComponent } from './cashiers.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('CashiersComponent', () => {
  let component: CashiersComponent;
  let fixture: ComponentFixture<CashiersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CashiersComponent],
      imports: [RouterTestingModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CashiersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

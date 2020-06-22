import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageCurrenciesComponent } from './manage-currencies.component';

describe('ManageCurrenciesComponent', () => {
  let component: ManageCurrenciesComponent;
  let fixture: ComponentFixture<ManageCurrenciesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageCurrenciesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageCurrenciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

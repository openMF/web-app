import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingProductGeneralTabComponent } from './saving-product-general-tab.component';

describe('SavingProductGeneralTabComponent', () => {
  let component: SavingProductGeneralTabComponent;
  let fixture: ComponentFixture<SavingProductGeneralTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SavingProductGeneralTabComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SavingProductGeneralTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

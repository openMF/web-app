import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSavingsChargeComponent } from './add-savings-charge.component';

describe('AddSavingsChargeComponent', () => {
  let component: AddSavingsChargeComponent;
  let fixture: ComponentFixture<AddSavingsChargeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddSavingsChargeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSavingsChargeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

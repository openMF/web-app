import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddClientChargeComponent } from './add-client-charge.component';

describe('AddClientChargeComponent', () => {
  let component: AddClientChargeComponent;
  let fixture: ComponentFixture<AddClientChargeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddClientChargeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddClientChargeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

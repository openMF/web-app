import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddressTabComponent } from './address-tab.component';

describe('AddressTabComponent', () => {
  let component: AddressTabComponent;
  let fixture: ComponentFixture<AddressTabComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddressTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

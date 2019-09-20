import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAccountNumberPreferenceComponent } from './view-account-number-preference.component';

describe('ViewAccountNumberPreferenceComponent', () => {
  let component: ViewAccountNumberPreferenceComponent;
  let fixture: ComponentFixture<ViewAccountNumberPreferenceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewAccountNumberPreferenceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewAccountNumberPreferenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

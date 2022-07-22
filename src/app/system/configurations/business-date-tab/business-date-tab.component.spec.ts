import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessDateTabComponent } from './business-date-tab.component';

describe('BusinessDateTabComponent', () => {
  let component: BusinessDateTabComponent;
  let fixture: ComponentFixture<BusinessDateTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusinessDateTabComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusinessDateTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

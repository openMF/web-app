import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OfficeNavigationComponent } from './office-navigation.component';

describe('OfficeNavigationComponent', () => {
  let component: OfficeNavigationComponent;
  let fixture: ComponentFixture<OfficeNavigationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OfficeNavigationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OfficeNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

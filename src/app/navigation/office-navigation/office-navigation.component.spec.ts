import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OfficeNavigationComponent } from './office-navigation.component';

describe('OfficeNavigationComponent', () => {
  let component: OfficeNavigationComponent;
  let fixture: ComponentFixture<OfficeNavigationComponent>;

  beforeEach(async(() => {
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

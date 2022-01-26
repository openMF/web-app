import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ManageReportsComponent } from './manage-reports.component';

describe('ManageReportsComponent', () => {
  let component: ManageReportsComponent;
  let fixture: ComponentFixture<ManageReportsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageReportsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

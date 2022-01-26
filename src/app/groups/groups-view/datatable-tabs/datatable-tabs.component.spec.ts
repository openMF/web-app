import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DatatableTabsComponent } from './datatable-tabs.component';

describe('DatatableTabsComponent', () => {
  let component: DatatableTabsComponent;
  let fixture: ComponentFixture<DatatableTabsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DatatableTabsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatatableTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ViewDataTableComponent } from './view-data-table.component';

describe('ViewDataTableComponent', () => {
  let component: ViewDataTableComponent;
  let fixture: ComponentFixture<ViewDataTableComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewDataTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewDataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

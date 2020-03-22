import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDataTableComponent } from './view-data-table.component';

describe('ViewDataTableComponent', () => {
  let component: ViewDataTableComponent;
  let fixture: ComponentFixture<ViewDataTableComponent>;

  beforeEach(async(() => {
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

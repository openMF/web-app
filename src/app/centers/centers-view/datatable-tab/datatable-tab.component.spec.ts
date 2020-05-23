import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatatableTabComponent } from './datatable-tab.component';

describe('DatatableTabComponent', () => {
  let component: DatatableTabComponent;
  let fixture: ComponentFixture<DatatableTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatatableTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatatableTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewBulkImportComponent } from './view-bulk-import.component';

describe('ViewBulkImportComponent', () => {
  let component: ViewBulkImportComponent;
  let fixture: ComponentFixture<ViewBulkImportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewBulkImportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewBulkImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ViewBulkImportComponent } from './view-bulk-import.component';

describe('ViewBulkImportComponent', () => {
  let component: ViewBulkImportComponent;
  let fixture: ComponentFixture<ViewBulkImportComponent>;

  beforeEach(waitForAsync(() => {
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

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatatableMultiRowComponent } from './datatable-multi-row.component';

describe('DatatableMultiRowComponent', () => {
  let component: DatatableMultiRowComponent;
  let fixture: ComponentFixture<DatatableMultiRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DatatableMultiRowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DatatableMultiRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

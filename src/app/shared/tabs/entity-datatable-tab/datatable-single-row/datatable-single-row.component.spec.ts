import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatatableSingleRowComponent } from './datatable-single-row.component';

describe('DatatableSingleRowComponent', () => {
  let component: DatatableSingleRowComponent;
  let fixture: ComponentFixture<DatatableSingleRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DatatableSingleRowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DatatableSingleRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

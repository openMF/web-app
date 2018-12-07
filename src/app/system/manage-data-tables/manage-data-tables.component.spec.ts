import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageDataTablesComponent } from './manage-data-tables.component';

describe('ManageDataTablesComponent', () => {
  let component: ManageDataTablesComponent;
  let fixture: ComponentFixture<ManageDataTablesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageDataTablesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageDataTablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

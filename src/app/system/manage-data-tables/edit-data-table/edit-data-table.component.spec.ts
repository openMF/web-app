import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditDataTableComponent } from './edit-data-table.component';

describe('EditDataTableComponent', () => {
  let component: EditDataTableComponent;
  let fixture: ComponentFixture<EditDataTableComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditDataTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditDataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataFieldsComponent } from './data-fields.component';

describe('DataFieldsComponent', () => {
  let component: DataFieldsComponent;
  let fixture: ComponentFixture<DataFieldsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataFieldsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

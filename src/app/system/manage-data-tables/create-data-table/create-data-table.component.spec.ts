import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDataTableComponent } from './create-data-table.component';

describe('CreateDataTableComponent', () => {
  let component: CreateDataTableComponent;
  let fixture: ComponentFixture<CreateDataTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateDataTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateDataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

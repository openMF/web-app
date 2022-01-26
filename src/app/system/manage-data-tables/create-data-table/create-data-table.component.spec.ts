import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CreateDataTableComponent } from './create-data-table.component';

describe('CreateDataTableComponent', () => {
  let component: CreateDataTableComponent;
  let fixture: ComponentFixture<CreateDataTableComponent>;

  beforeEach(waitForAsync(() => {
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

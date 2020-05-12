import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditOfficeComponent } from './edit-office.component';

describe('EditOfficeComponent', () => {
  let component: EditOfficeComponent;
  let fixture: ComponentFixture<EditOfficeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditOfficeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditOfficeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

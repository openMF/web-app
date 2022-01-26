import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditOfficeComponent } from './edit-office.component';

describe('EditOfficeComponent', () => {
  let component: EditOfficeComponent;
  let fixture: ComponentFixture<EditOfficeComponent>;

  beforeEach(waitForAsync(() => {
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

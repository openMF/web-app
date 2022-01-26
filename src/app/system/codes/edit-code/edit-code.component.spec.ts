import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditCodeComponent } from './edit-code.component';

describe('EditCodeComponent', () => {
  let component: EditCodeComponent;
  let fixture: ComponentFixture<EditCodeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditCodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FormfieldComponent } from './formfield.component';

describe('FormfieldComponent', () => {
  let component: FormfieldComponent;
  let fixture: ComponentFixture<FormfieldComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FormfieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormfieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

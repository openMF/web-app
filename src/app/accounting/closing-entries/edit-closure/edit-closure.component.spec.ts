import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditClosureComponent } from './edit-closure.component';

describe('EditClosureComponent', () => {
  let component: EditClosureComponent;
  let fixture: ComponentFixture<EditClosureComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditClosureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditClosureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

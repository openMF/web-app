import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditHookComponent } from './edit-hook.component';

describe('EditHookComponent', () => {
  let component: EditHookComponent;
  let fixture: ComponentFixture<EditHookComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditHookComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditHookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

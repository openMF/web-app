import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ManageHooksComponent } from './manage-hooks.component';

describe('ManageHooksComponent', () => {
  let component: ManageHooksComponent;
  let fixture: ComponentFixture<ManageHooksComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageHooksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageHooksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageHooksComponent } from './manage-hooks.component';

describe('ManageHooksComponent', () => {
  let component: ManageHooksComponent;
  let fixture: ComponentFixture<ManageHooksComponent>;

  beforeEach(async(() => {
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

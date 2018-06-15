import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewUserComponent } from './view-user.component';

describe('ViewUserComponent', () => {
  let component: ViewUserComponent;
  let fixture: ComponentFixture<ViewUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

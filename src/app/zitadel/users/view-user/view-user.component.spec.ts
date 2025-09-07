import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewUserComponent as ViewUserZitadelComponent } from './view-user.component';

describe('ViewUserComponent', () => {
  let component: ViewUserZitadelComponent;
  let fixture: ComponentFixture<ViewUserZitadelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewUserZitadelComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewUserZitadelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

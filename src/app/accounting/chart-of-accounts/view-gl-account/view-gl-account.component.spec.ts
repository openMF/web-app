import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ViewGlAccountComponent } from './view-gl-account.component';

describe('ViewGlAccountComponent', () => {
  let component: ViewGlAccountComponent;
  let fixture: ComponentFixture<ViewGlAccountComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewGlAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewGlAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

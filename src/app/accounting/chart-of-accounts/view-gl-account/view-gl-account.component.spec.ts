import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewGlAccountComponent } from './view-gl-account.component';

describe('ViewGlAccountComponent', () => {
  let component: ViewGlAccountComponent;
  let fixture: ComponentFixture<ViewGlAccountComponent>;

  beforeEach(async(() => {
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

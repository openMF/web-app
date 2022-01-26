import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ViewHookComponent } from './view-hook.component';

describe('ViewHookComponent', () => {
  let component: ViewHookComponent;
  let fixture: ComponentFixture<ViewHookComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewHookComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewHookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

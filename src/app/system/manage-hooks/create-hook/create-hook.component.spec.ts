import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CreateHookComponent } from './create-hook.component';

describe('CreateHookComponent', () => {
  let component: CreateHookComponent;
  let fixture: ComponentFixture<CreateHookComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateHookComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateHookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

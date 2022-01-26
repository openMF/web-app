import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CreateCenterComponent } from './create-center.component';

describe('CreateCenterComponent', () => {
  let component: CreateCenterComponent;
  let fixture: ComponentFixture<CreateCenterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateCenterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

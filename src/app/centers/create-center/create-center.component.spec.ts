import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCenterComponent } from './create-center.component';

describe('CreateCenterComponent', () => {
  let component: CreateCenterComponent;
  let fixture: ComponentFixture<CreateCenterComponent>;

  beforeEach(async(() => {
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

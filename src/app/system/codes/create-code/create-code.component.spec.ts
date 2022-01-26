import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CreateCodeComponent } from './create-code.component';

describe('CreateCodeComponent', () => {
  let component: CreateCodeComponent;
  let fixture: ComponentFixture<CreateCodeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateCodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

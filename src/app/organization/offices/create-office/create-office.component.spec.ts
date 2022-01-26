import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CreateOfficeComponent } from './create-office.component';

describe('CreateOfficeComponent', () => {
  let component: CreateOfficeComponent;
  let fixture: ComponentFixture<CreateOfficeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateOfficeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateOfficeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

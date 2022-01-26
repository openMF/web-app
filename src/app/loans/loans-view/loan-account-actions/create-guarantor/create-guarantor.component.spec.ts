import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CreateGuarantorComponent } from './create-guarantor.component';

describe('CreateGuarantorComponent', () => {
  let component: CreateGuarantorComponent;
  let fixture: ComponentFixture<CreateGuarantorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateGuarantorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateGuarantorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

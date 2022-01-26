import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CreateChargeComponent } from './create-charge.component';

describe('CreateChargeComponent', () => {
  let component: CreateChargeComponent;
  let fixture: ComponentFixture<CreateChargeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateChargeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateChargeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

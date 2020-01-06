import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateChargeComponent } from './create-charge.component';

describe('CreateChargeComponent', () => {
  let component: CreateChargeComponent;
  let fixture: ComponentFixture<CreateChargeComponent>;

  beforeEach(async(() => {
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

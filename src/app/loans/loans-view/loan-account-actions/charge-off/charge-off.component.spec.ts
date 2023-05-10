import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargeOffComponent } from './charge-off.component';

describe('ChargeOffComponent', () => {
  let component: ChargeOffComponent;
  let fixture: ComponentFixture<ChargeOffComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChargeOffComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargeOffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

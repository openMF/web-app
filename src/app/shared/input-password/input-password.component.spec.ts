import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputPasswordComponent } from './input-password.component';

describe('InputPasswordComponent', () => {
  let component: InputPasswordComponent;
  let fixture: ComponentFixture<InputPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InputPasswordComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(InputPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

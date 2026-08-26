import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoopLoginComponent } from './coop-login.component';

describe('CoopLoginComponent', () => {
  let component: CoopLoginComponent;
  let fixture: ComponentFixture<CoopLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoopLoginComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CoopLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

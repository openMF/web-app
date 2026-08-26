import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoopProfileComponent } from './coop-profile.component';

describe('CoopProfileComponent', () => {
  let component: CoopProfileComponent;
  let fixture: ComponentFixture<CoopProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoopProfileComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CoopProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

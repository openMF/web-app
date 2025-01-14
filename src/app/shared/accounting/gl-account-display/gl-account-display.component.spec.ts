import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlAccountDisplayComponent } from './gl-account-display.component';

describe('GlAccountDisplayComponent', () => {
  let component: GlAccountDisplayComponent;
  let fixture: ComponentFixture<GlAccountDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GlAccountDisplayComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(GlAccountDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

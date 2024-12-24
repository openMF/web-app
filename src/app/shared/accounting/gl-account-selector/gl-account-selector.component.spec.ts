import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlAccountSelectorComponent } from './gl-account-selector.component';

describe('GlAccountSelectorComponent', () => {
  let component: GlAccountSelectorComponent;
  let fixture: ComponentFixture<GlAccountSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GlAccountSelectorComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(GlAccountSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

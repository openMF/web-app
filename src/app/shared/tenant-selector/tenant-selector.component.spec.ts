import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantSelectorComponent } from './tenant-selector.component';
import { CommonModule } from '@angular/common';

describe('TenantSelectorComponent', () => {
  let component: TenantSelectorComponent;
  let fixture: ComponentFixture<TenantSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TenantSelectorComponent],
      imports: [CommonModule]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TenantSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

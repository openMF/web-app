import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantSelectorComponent } from './tenant-selector.component';

describe('TenantSelectorComponent', () => {
  let component: TenantSelectorComponent;
  let fixture: ComponentFixture<TenantSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TenantSelectorComponent ]
    })
    .compileComponents();
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

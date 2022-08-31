import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfficeHierarchyComponent } from './office-hierarchy.component';

describe('OfficeHierarchyComponent', () => {
  let component: OfficeHierarchyComponent;
  let fixture: ComponentFixture<OfficeHierarchyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OfficeHierarchyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OfficeHierarchyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

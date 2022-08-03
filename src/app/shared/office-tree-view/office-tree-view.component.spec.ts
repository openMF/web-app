import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfficeTreeViewComponent } from './office-tree-view.component';

describe('OfficeTreeViewComponent', () => {
  let component: OfficeTreeViewComponent;
  let fixture: ComponentFixture<OfficeTreeViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OfficeTreeViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OfficeTreeViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

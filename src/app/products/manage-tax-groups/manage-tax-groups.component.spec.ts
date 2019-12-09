import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageTaxGroupsComponent } from './manage-tax-groups.component';

describe('ManageTaxGroupsComponent', () => {
  let component: ManageTaxGroupsComponent;
  let fixture: ComponentFixture<ManageTaxGroupsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageTaxGroupsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageTaxGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

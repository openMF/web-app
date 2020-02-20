import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditChargeComponent } from './edit-charge.component';

describe('EditChargeComponent', () => {
  let component: EditChargeComponent;
  let fixture: ComponentFixture<EditChargeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditChargeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditChargeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

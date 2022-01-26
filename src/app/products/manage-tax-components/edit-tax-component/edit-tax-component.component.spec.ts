import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditTaxComponentComponent } from './edit-tax-component.component';

describe('EditTaxComponentComponent', () => {
  let component: EditTaxComponentComponent;
  let fixture: ComponentFixture<EditTaxComponentComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditTaxComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditTaxComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

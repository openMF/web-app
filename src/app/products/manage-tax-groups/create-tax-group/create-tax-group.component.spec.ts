import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CreateTaxGroupComponent } from './create-tax-group.component';

describe('CreateTaxGroupComponent', () => {
  let component: CreateTaxGroupComponent;
  let fixture: ComponentFixture<CreateTaxGroupComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateTaxGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateTaxGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

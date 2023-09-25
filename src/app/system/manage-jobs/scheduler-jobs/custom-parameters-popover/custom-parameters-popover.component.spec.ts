import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomParametersPopoverComponent } from './custom-parameters-popover.component';

describe('CustomParametersPopoverComponent', () => {
  let component: CustomParametersPopoverComponent;
  let fixture: ComponentFixture<CustomParametersPopoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomParametersPopoverComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomParametersPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

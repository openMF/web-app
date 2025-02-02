import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomParametersPopoverComponent } from './custom-parameters-popover.component';
import { HttpClientModule } from '@angular/common/http';

describe('CustomParametersPopoverComponent', () => {
  let component: CustomParametersPopoverComponent;
  let fixture: ComponentFixture<CustomParametersPopoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomParametersPopoverComponent],
      imports: [HttpClientModule]
    }).compileComponents();
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

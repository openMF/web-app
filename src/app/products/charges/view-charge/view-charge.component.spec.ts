import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewChargeComponent } from './view-charge.component';
import { HttpClientModule } from '@angular/common/http';

describe('ViewChargeComponent', () => {
  let component: ViewChargeComponent;
  let fixture: ComponentFixture<ViewChargeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewChargeComponent],
      imports: [HttpClientModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewChargeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

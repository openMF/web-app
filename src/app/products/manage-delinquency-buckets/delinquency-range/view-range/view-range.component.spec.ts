import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRangeComponent } from './view-range.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('ViewRangeComponent', () => {
  let component: ViewRangeComponent;
  let fixture: ComponentFixture<ViewRangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewRangeComponent],
      imports: [RouterTestingModule]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

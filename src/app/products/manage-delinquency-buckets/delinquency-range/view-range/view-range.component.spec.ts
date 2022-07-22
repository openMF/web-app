import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRangeComponent } from './view-range.component';

describe('ViewRangeComponent', () => {
  let component: ViewRangeComponent;
  let fixture: ComponentFixture<ViewRangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewRangeComponent ]
    })
    .compileComponents();
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

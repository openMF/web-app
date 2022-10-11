import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewOutletComponent } from './view-outlet.component';

describe('ViewOutletComponent', () => {
  let component: ViewOutletComponent;
  let fixture: ComponentFixture<ViewOutletComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewOutletComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewOutletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

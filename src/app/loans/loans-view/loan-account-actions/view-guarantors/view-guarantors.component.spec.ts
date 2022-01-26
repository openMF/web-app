import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ViewGuarantorsComponent } from './view-guarantors.component';

describe('ViewGuarantorsComponent', () => {
  let component: ViewGuarantorsComponent;
  let fixture: ComponentFixture<ViewGuarantorsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewGuarantorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewGuarantorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

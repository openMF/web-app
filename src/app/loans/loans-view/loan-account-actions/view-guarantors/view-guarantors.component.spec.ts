import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewGuarantorsComponent } from './view-guarantors.component';

describe('ViewGuarantorsComponent', () => {
  let component: ViewGuarantorsComponent;
  let fixture: ComponentFixture<ViewGuarantorsComponent>;

  beforeEach(async(() => {
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

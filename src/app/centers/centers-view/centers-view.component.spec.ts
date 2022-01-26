import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CentersViewComponent } from './centers-view.component';

describe('CentersViewComponent', () => {
  let component: CentersViewComponent;
  let fixture: ComponentFixture<CentersViewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CentersViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CentersViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

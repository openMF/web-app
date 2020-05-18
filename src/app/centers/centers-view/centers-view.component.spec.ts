import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CentersViewComponent } from './centers-view.component';

describe('CentersViewComponent', () => {
  let component: CentersViewComponent;
  let fixture: ComponentFixture<CentersViewComponent>;

  beforeEach(async(() => {
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

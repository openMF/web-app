import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargesOverviewComponent } from './charges-overview.component';

describe('ChargesOverviewComponent', () => {
  let component: ChargesOverviewComponent;
  let fixture: ComponentFixture<ChargesOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChargesOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargesOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

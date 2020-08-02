import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDividendComponent } from './view-dividend.component';

describe('ViewDividendComponent', () => {
  let component: ViewDividendComponent;
  let fixture: ComponentFixture<ViewDividendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewDividendComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewDividendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

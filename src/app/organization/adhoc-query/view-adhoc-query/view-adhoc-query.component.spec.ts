import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAdhocQueryComponent } from './view-adhoc-query.component';

describe('ViewAdhocQueryComponent', () => {
  let component: ViewAdhocQueryComponent;
  let fixture: ComponentFixture<ViewAdhocQueryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewAdhocQueryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewAdhocQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

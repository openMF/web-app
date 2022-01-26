import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ViewAdhocQueryComponent } from './view-adhoc-query.component';

describe('ViewAdhocQueryComponent', () => {
  let component: ViewAdhocQueryComponent;
  let fixture: ComponentFixture<ViewAdhocQueryComponent>;

  beforeEach(waitForAsync(() => {
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

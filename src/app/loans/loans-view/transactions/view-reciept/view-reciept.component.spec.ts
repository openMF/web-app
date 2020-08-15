import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRecieptComponent } from './view-reciept.component';

describe('ViewRecieptComponent', () => {
  let component: ViewRecieptComponent;
  let fixture: ComponentFixture<ViewRecieptComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewRecieptComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewRecieptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

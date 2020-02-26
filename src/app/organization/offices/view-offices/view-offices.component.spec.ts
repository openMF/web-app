import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewOfficesComponent } from './view-offices.component';

describe('ViewOfficesComponent', () => {
  let component: ViewOfficesComponent;
  let fixture: ComponentFixture<ViewOfficesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewOfficesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewOfficesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

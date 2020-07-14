import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UndoDisbursalComponent } from './undo-disbursal.component';

describe('UndoDisbursalComponent', () => {
  let component: UndoDisbursalComponent;
  let fixture: ComponentFixture<UndoDisbursalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UndoDisbursalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UndoDisbursalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

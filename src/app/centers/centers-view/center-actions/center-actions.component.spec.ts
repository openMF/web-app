import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CenterActionsComponent } from './center-actions.component';

describe('CenterActionsComponent', () => {
  let component: CenterActionsComponent;
  let fixture: ComponentFixture<CenterActionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CenterActionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CenterActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

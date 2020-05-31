import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoansViewComponent } from './loans-view.component';

describe('LoansViewComponent', () => {
  let component: LoansViewComponent;
  let fixture: ComponentFixture<LoansViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoansViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoansViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

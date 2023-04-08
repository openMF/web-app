import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewFundComponent } from './view-fund.component';

describe('ViewFundComponent', () => {
  let component: ViewFundComponent;
  let fixture: ComponentFixture<ViewFundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewFundComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewFundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

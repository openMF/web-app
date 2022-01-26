import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RejectSharesComponent } from './reject-shares.component';

describe('RejectSharesComponent', () => {
  let component: RejectSharesComponent;
  let fixture: ComponentFixture<RejectSharesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RejectSharesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RejectSharesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

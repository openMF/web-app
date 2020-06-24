import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectSharesComponent } from './reject-shares.component';

describe('RejectSharesComponent', () => {
  let component: RejectSharesComponent;
  let fixture: ComponentFixture<RejectSharesComponent>;

  beforeEach(async(() => {
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

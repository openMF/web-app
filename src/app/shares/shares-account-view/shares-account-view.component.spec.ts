import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharesAccountViewComponent } from './shares-account-view.component';

describe('SharesAccountViewComponent', () => {
  let component: SharesAccountViewComponent;
  let fixture: ComponentFixture<SharesAccountViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SharesAccountViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SharesAccountViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

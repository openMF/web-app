import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharesComponent } from './shares.component';

describe('SharesComponent', () => {
  let component: SharesComponent;
  let fixture: ComponentFixture<SharesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SharesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SharesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

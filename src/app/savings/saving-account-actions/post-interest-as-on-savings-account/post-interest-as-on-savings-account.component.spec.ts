import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PostInterestAsOnSavingsAccountComponent } from './post-interest-as-on-savings-account.component';

describe('PostInterestAsOnSavingsAccountComponent', () => {
  let component: PostInterestAsOnSavingsAccountComponent;
  let fixture: ComponentFixture<PostInterestAsOnSavingsAccountComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PostInterestAsOnSavingsAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostInterestAsOnSavingsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

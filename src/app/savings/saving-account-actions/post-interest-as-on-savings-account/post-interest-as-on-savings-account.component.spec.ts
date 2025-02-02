import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostInterestAsOnSavingsAccountComponent } from './post-interest-as-on-savings-account.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';

describe('PostInterestAsOnSavingsAccountComponent', () => {
  let component: PostInterestAsOnSavingsAccountComponent;
  let fixture: ComponentFixture<PostInterestAsOnSavingsAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PostInterestAsOnSavingsAccountComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        RouterTestingModule
      ],
      providers: [DatePipe]
    }).compileComponents();
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

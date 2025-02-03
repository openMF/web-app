import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharesAccountViewComponent } from './shares-account-view.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('SharesAccountViewComponent', () => {
  let component: SharesAccountViewComponent;
  let fixture: ComponentFixture<SharesAccountViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SharesAccountViewComponent],
      imports: [RouterTestingModule]
    }).compileComponents();
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

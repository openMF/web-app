import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveSharesComponent } from './approve-shares.component';
import { HttpClientModule } from '@angular/common/http';

describe('ApproveSharesComponent', () => {
  let component: ApproveSharesComponent;
  let fixture: ComponentFixture<ApproveSharesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ApproveSharesComponent],
      imports: [HttpClientModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveSharesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

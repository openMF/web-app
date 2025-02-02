import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveSharesComponent } from './approve-shares.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';

describe('ApproveSharesComponent', () => {
  let component: ApproveSharesComponent;
  let fixture: ComponentFixture<ApproveSharesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ApproveSharesComponent],
      imports: [
        HttpClientModule,
        RouterTestingModule
      ]
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

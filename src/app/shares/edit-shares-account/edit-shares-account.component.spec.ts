import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditSharesAccountComponent } from './edit-shares-account.component';

describe('EditSharesAccountComponent', () => {
  let component: EditSharesAccountComponent;
  let fixture: ComponentFixture<EditSharesAccountComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditSharesAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSharesAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

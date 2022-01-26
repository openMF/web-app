import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditSavingsAccountComponent } from './edit-savings-account.component';

describe('EditSavingsAccountComponent', () => {
  let component: EditSavingsAccountComponent;
  let fixture: ComponentFixture<EditSavingsAccountComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditSavingsAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSavingsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

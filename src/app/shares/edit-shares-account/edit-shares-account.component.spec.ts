import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSharesAccountComponent } from './edit-shares-account.component';

describe('EditSharesAccountComponent', () => {
  let component: EditSharesAccountComponent;
  let fixture: ComponentFixture<EditSharesAccountComponent>;

  beforeEach(async(() => {
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

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageSavingsAccountComponent } from './manage-savings-account.component';

describe('ManageSavingsAccountComponent', () => {
  let component: ManageSavingsAccountComponent;
  let fixture: ComponentFixture<ManageSavingsAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageSavingsAccountComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageSavingsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

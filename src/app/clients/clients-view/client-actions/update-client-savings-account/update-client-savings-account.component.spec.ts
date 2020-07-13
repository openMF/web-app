import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateClientSavingsAccountComponent } from './update-client-savings-account.component';

describe('UpdateClientSavingsAccountComponent', () => {
  let component: UpdateClientSavingsAccountComponent;
  let fixture: ComponentFixture<UpdateClientSavingsAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateClientSavingsAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateClientSavingsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

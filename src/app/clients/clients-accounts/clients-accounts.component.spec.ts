import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientsAccountsComponent } from './clients-accounts.component';

describe('ClientsAccountsComponent', () => {
  let component: ClientsAccountsComponent;
  let fixture: ComponentFixture<ClientsAccountsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientsAccountsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientsAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ClientFamilyMemberDialogComponent } from './client-family-member-dialog.component';

describe('ClientFamilyMemberDialogComponent', () => {
  let component: ClientFamilyMemberDialogComponent;
  let fixture: ComponentFixture<ClientFamilyMemberDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientFamilyMemberDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientFamilyMemberDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

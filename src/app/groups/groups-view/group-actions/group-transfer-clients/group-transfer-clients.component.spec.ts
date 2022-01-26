import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GroupTransferClientsComponent } from './group-transfer-clients.component';

describe('GroupTransferClientsComponent', () => {
  let component: GroupTransferClientsComponent;
  let fixture: ComponentFixture<GroupTransferClientsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupTransferClientsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupTransferClientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

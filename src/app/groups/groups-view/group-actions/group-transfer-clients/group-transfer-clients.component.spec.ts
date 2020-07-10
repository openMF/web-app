import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupTransferClientsComponent } from './group-transfer-clients.component';

describe('GroupTransferClientsComponent', () => {
  let component: GroupTransferClientsComponent;
  let fixture: ComponentFixture<GroupTransferClientsComponent>;

  beforeEach(async(() => {
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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientContactInformationDialogComponent } from './client-contact-information-dialog.component';

describe('ClientContactInformationDialogComponent', () => {
  let component: ClientContactInformationDialogComponent;
  let fixture: ComponentFixture<ClientContactInformationDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientContactInformationDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientContactInformationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

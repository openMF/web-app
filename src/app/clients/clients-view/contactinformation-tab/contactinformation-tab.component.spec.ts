import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactInformationTabComponent } from './contactinformation-tab.component';

describe('ContactInformationTabComponent', () => {
  let component: ContactInformationTabComponent;
  let fixture: ComponentFixture<ContactInformationTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactInformationTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactInformationTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

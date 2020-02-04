import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTellerComponent } from './edit-teller.component';

describe('EditTellerComponent', () => {
  let component: EditTellerComponent;
  let fixture: ComponentFixture<EditTellerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditTellerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditTellerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

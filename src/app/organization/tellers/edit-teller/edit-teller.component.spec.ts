import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditTellerComponent } from './edit-teller.component';

describe('EditTellerComponent', () => {
  let component: EditTellerComponent;
  let fixture: ComponentFixture<EditTellerComponent>;

  beforeEach(waitForAsync(() => {
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

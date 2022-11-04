import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientDatatableStepComponent } from './client-datatable-step.component';

describe('ClientDatatableStepComponent', () => {
  let component: ClientDatatableStepComponent;
  let fixture: ComponentFixture<ClientDatatableStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientDatatableStepComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientDatatableStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

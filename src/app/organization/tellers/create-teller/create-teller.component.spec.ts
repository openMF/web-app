import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTellerComponent } from './create-teller.component';

describe('CreateTellerComponent', () => {
  let component: CreateTellerComponent;
  let fixture: ComponentFixture<CreateTellerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateTellerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateTellerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

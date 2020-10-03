import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSelfServiceUserComponent } from './create-self-service-user.component';

describe('CreateSelfServiceUserComponent', () => {
  let component: CreateSelfServiceUserComponent;
  let fixture: ComponentFixture<CreateSelfServiceUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateSelfServiceUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateSelfServiceUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

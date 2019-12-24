import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOfficesComponent } from './create-offices.component';

describe('CreateOfficesComponent', () => {
  let component: CreateOfficesComponent;
  let fixture: ComponentFixture<CreateOfficesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateOfficesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateOfficesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

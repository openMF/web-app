import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateClosureComponent } from './create-closure.component';

describe('CreateClosureComponent', () => {
  let component: CreateClosureComponent;
  let fixture: ComponentFixture<CreateClosureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateClosureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateClosureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateGlAccountComponent } from './create-gl-account.component';

describe('CreateGlAccountComponent', () => {
  let component: CreateGlAccountComponent;
  let fixture: ComponentFixture<CreateGlAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateGlAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateGlAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

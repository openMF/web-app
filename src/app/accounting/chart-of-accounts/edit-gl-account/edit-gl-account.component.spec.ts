import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditGlAccountComponent } from './edit-gl-account.component';

describe('EditGlAccountComponent', () => {
  let component: EditGlAccountComponent;
  let fixture: ComponentFixture<EditGlAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditGlAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditGlAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

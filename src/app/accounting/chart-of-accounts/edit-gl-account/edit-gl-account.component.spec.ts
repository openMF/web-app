import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditGlAccountComponent } from './edit-gl-account.component';

describe('EditGlAccountComponent', () => {
  let component: EditGlAccountComponent;
  let fixture: ComponentFixture<EditGlAccountComponent>;

  beforeEach(waitForAsync(() => {
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

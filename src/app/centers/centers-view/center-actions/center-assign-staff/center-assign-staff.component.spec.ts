import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CenterAssignStaffComponent } from './center-assign-staff.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

describe('CenterAssignStaffComponent', () => {
  let component: CenterAssignStaffComponent;
  let fixture: ComponentFixture<CenterAssignStaffComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CenterAssignStaffComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CenterAssignStaffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

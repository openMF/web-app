import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageProjectParticipationComponent } from './manage-project-participation.component';

describe('ManageProjectParticipationComponent', () => {
  let component: ManageProjectParticipationComponent;
  let fixture: ComponentFixture<ManageProjectParticipationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageProjectParticipationComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ManageProjectParticipationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

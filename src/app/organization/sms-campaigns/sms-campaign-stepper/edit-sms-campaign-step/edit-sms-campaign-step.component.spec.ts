import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSmsCampaignStepComponent } from './edit-sms-campaign-step.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

describe('EditSmsCampaignStepComponent', () => {
  let component: EditSmsCampaignStepComponent;
  let fixture: ComponentFixture<EditSmsCampaignStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditSmsCampaignStepComponent],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSmsCampaignStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

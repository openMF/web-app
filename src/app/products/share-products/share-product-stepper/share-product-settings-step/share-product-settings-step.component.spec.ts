import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ShareProductSettingsStepComponent } from './share-product-settings-step.component';

describe('ShareProductSettingsStepComponent', () => {
  let component: ShareProductSettingsStepComponent;
  let fixture: ComponentFixture<ShareProductSettingsStepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ShareProductSettingsStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareProductSettingsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

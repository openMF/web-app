import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareProductSettingsStepComponent } from './share-product-settings-step.component';

describe('ShareProductSettingsStepComponent', () => {
  let component: ShareProductSettingsStepComponent;
  let fixture: ComponentFixture<ShareProductSettingsStepComponent>;

  beforeEach(async(() => {
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

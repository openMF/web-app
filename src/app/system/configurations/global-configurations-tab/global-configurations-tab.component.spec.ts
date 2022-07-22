import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalConfigurationsTabComponent } from './global-configurations-tab.component';

describe('GlobalConfigurationsTabComponent', () => {
  let component: GlobalConfigurationsTabComponent;
  let fixture: ComponentFixture<GlobalConfigurationsTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GlobalConfigurationsTabComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobalConfigurationsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

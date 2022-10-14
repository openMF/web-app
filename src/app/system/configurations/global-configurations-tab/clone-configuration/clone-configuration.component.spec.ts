import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloneConfigurationComponent } from './clone-configuration.component';

describe('CloneConfigurationComponent', () => {
  let component: CloneConfigurationComponent;
  let fixture: ComponentFixture<CloneConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CloneConfigurationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CloneConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

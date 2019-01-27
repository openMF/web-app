import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditConfigurationComponent } from './edit-configuration.component';

describe('EditConfigurationComponent', () => {
  let component: EditConfigurationComponent;
  let fixture: ComponentFixture<EditConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

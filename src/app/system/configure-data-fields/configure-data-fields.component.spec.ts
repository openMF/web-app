import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigureDataFieldsComponent } from './configure-data-fields.component';

describe('ConfigureDataFieldsComponent', () => {
  let component: ConfigureDataFieldsComponent;
  let fixture: ComponentFixture<ConfigureDataFieldsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfigureDataFieldsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigureDataFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

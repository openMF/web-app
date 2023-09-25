import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomParametersTableComponent } from './custom-parameters-table.component';

describe('CustomParametersTableComponent', () => {
  let component: CustomParametersTableComponent;
  let fixture: ComponentFixture<CustomParametersTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomParametersTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomParametersTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

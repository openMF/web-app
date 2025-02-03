import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomParametersTableComponent } from './custom-parameters-table.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('CustomParametersTableComponent', () => {
  let component: CustomParametersTableComponent;
  let fixture: ComponentFixture<CustomParametersTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomParametersTableComponent],
      imports: [TranslateModule],
      providers: [TranslateService]
    }).compileComponents();
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

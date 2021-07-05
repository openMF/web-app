import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FontPickerComponent } from './font-picker.component';

describe('FontPickerComponent', () => {
  let component: FontPickerComponent;
  let fixture: ComponentFixture<FontPickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FontPickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FontPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

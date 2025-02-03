import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewStandingInstructionsComponent } from './view-standing-instructions.component';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('ViewStandingInstructionsComponent', () => {
  let component: ViewStandingInstructionsComponent;
  let fixture: ComponentFixture<ViewStandingInstructionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewStandingInstructionsComponent],
      imports: [
        RouterTestingModule,
        TranslateModule
      ],
      providers: [TranslateService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewStandingInstructionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

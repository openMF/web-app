import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GeneralTabComponent } from './general-tab.component';

describe('GeneralTabComponent', () => {
  let component: GeneralTabComponent;
  let fixture: ComponentFixture<GeneralTabComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneralTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ForeclosureComponent } from './foreclosure.component';

describe('ForeclosureComponent', () => {
  let component: ForeclosureComponent;
  let fixture: ComponentFixture<ForeclosureComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ForeclosureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForeclosureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

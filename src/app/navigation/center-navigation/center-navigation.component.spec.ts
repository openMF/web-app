import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CenterNavigationComponent } from './center-navigation.component';

describe('CenterNavigationComponent', () => {
  let component: CenterNavigationComponent;
  let fixture: ComponentFixture<CenterNavigationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CenterNavigationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CenterNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

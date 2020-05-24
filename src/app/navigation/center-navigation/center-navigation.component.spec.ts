import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CenterNavigationComponent } from './center-navigation.component';

describe('CenterNavigationComponent', () => {
  let component: CenterNavigationComponent;
  let fixture: ComponentFixture<CenterNavigationComponent>;

  beforeEach(async(() => {
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

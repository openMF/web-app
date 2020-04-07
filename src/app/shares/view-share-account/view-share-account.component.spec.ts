import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewShareAccountComponent } from './view-share-account.component';

describe('ViewShareAccountComponent', () => {
  let component: ViewShareAccountComponent;
  let fixture: ComponentFixture<ViewShareAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewShareAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewShareAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

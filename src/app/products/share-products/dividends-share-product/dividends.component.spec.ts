import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareProductsDividendsComponent } from './dividends.components';

describe('ShareProductsComponent', () => {
  let component: ShareProductsDividendsComponent;
  let fixture: ComponentFixture<ShareProductsDividendsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShareProductsDividendsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareProductsDividendsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TellersComponent } from './tellers.component';

describe('TellersComponent', () => {
  let component: TellersComponent;
  let fixture: ComponentFixture<TellersComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TellersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TellersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

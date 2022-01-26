import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CodesComponent } from './codes.component';

describe('CodesComponent', () => {
  let component: CodesComponent;
  let fixture: ComponentFixture<CodesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CodesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CodesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WriteOffPageComponent } from './write-off-page.component';

describe('WriteOffPageComponent', () => {
  let component: WriteOffPageComponent;
  let fixture: ComponentFixture<WriteOffPageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WriteOffPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WriteOffPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

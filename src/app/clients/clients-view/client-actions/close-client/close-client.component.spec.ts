import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CloseClientComponent } from './close-client.component';

describe('CloseClientComponent', () => {
  let component: CloseClientComponent;
  let fixture: ComponentFixture<CloseClientComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CloseClientComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CloseClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

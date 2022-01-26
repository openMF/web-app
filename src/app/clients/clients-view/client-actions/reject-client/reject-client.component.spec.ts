import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RejectClientComponent } from './reject-client.component';

describe('RejectClientComponent', () => {
  let component: RejectClientComponent;
  let fixture: ComponentFixture<RejectClientComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RejectClientComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RejectClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

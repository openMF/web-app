import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReactivateClientComponent } from './reactivate-client.component';

describe('ReactivateClientComponent', () => {
  let component: ReactivateClientComponent;
  let fixture: ComponentFixture<ReactivateClientComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReactivateClientComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReactivateClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

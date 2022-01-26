import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ClientTrendsBarComponent } from './client-trends-bar.component';

describe('ClientTrendsBarComponent', () => {
  let component: ClientTrendsBarComponent;
  let fixture: ComponentFixture<ClientTrendsBarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientTrendsBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientTrendsBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

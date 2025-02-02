import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientTrendsBarComponent } from './client-trends-bar.component';
import { HttpClientModule } from '@angular/common/http';

describe('ClientTrendsBarComponent', () => {
  let component: ClientTrendsBarComponent;
  let fixture: ComponentFixture<ClientTrendsBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ClientTrendsBarComponent],
      imports: [HttpClientModule]
    }).compileComponents();
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

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ClientsViewComponent } from './clients-view.component';

describe('ClientsViewComponent', () => {
  let component: ClientsViewComponent;
  let fixture: ComponentFixture<ClientsViewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientsViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientsViewComponent } from './clients-view.component';

describe('ClientsViewComponent', () => {
  let component: ClientsViewComponent;
  let fixture: ComponentFixture<ClientsViewComponent>;

  beforeEach(async(() => {
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

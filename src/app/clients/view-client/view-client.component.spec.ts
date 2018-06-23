import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewClientComponent } from './view-client.component';

describe('CreateClientComponent', () => {
  let component: ViewClientComponent;
  let fixture: ComponentFixture<ViewClientComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewClientComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

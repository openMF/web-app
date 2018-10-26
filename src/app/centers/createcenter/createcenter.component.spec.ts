import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatecenterComponent } from './createcenter.component';

describe('CreatecenterComponent', () => {
  let component: CreatecenterComponent;
  let fixture: ComponentFixture<CreatecenterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreatecenterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatecenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

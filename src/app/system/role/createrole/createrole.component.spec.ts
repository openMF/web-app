import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateroleComponent } from './createrole.component';

describe('CreateroleComponent', () => {
  let component: CreateroleComponent;
  let fixture: ComponentFixture<CreateroleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateroleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateroleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

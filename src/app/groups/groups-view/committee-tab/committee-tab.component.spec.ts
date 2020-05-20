import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommitteeTabComponent } from './committee-tab.component';

describe('CommitteeTabComponent', () => {
  let component: CommitteeTabComponent;
  let fixture: ComponentFixture<CommitteeTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommitteeTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommitteeTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

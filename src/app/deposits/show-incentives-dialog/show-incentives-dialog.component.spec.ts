import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowIncentivesDialogComponent } from './show-incentives-dialog.component';

describe('ShowIncentivesDialogComponent', () => {
  let component: ShowIncentivesDialogComponent;
  let fixture: ComponentFixture<ShowIncentivesDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowIncentivesDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowIncentivesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

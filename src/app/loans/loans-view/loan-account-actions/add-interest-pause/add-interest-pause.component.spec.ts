import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddInterestPauseComponent } from './add-interest-pause.component';

describe('AddInterestPauseComponent', () => {
  let component: AddInterestPauseComponent;
  let fixture: ComponentFixture<AddInterestPauseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddInterestPauseComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AddInterestPauseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

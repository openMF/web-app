import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingsActiveClientMembersComponent } from './savings-active-client-members.component';

describe('SavingsActiveClientMembersComponent', () => {
  let component: SavingsActiveClientMembersComponent;
  let fixture: ComponentFixture<SavingsActiveClientMembersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SavingsActiveClientMembersComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SavingsActiveClientMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

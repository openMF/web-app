import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoansActiveClientMembersComponent } from './loans-active-client-members.component';

describe('LoansActiveClientMembersComponent', () => {
  let component: LoansActiveClientMembersComponent;
  let fixture: ComponentFixture<LoansActiveClientMembersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoansActiveClientMembersComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LoansActiveClientMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

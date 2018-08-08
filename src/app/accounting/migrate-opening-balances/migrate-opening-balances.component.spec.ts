import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MigrateOpeningBalancesComponent } from './migrate-opening-balances.component';

describe('MigrateOpeningBalancesComponent', () => {
  let component: MigrateOpeningBalancesComponent;
  let fixture: ComponentFixture<MigrateOpeningBalancesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MigrateOpeningBalancesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MigrateOpeningBalancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

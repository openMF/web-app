import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DistributeFundDialogComponent } from './distribute-fund-dialog.component';

describe('DistributeFundDialogComponent', () => {
  let component: DistributeFundDialogComponent;
  let fixture: ComponentFixture<DistributeFundDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DistributeFundDialogComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DistributeFundDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

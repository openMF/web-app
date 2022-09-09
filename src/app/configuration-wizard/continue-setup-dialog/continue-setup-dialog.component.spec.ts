import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContinueSetupDialogComponent } from './continue-setup-dialog.component';

describe('ContinueSetupDialogComponent', () => {
  let component: ContinueSetupDialogComponent;
  let fixture: ComponentFixture<ContinueSetupDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContinueSetupDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContinueSetupDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

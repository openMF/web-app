import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareProductChargesStepComponent } from './share-product-charges-step.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';

describe('ShareProductChargesStepComponent', () => {
  let component: ShareProductChargesStepComponent;
  let fixture: ComponentFixture<ShareProductChargesStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ShareProductChargesStepComponent],
      imports: [
        ReactiveFormsModule,
        MatDialogModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareProductChargesStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

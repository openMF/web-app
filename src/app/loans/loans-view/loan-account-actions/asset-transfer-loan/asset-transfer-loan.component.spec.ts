import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetTransferLoanComponent } from './asset-transfer-loan.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

describe('AssetTransferLoanComponent', () => {
  let component: AssetTransferLoanComponent;
  let fixture: ComponentFixture<AssetTransferLoanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AssetTransferLoanComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetTransferLoanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalAssetOwnerTabComponent } from './external-asset-owner-tab.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

describe('ExternalAssetOwnerTabComponent', () => {
  let component: ExternalAssetOwnerTabComponent;
  let fixture: ComponentFixture<ExternalAssetOwnerTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExternalAssetOwnerTabComponent],
      imports: [
        RouterTestingModule,
        MatDialogModule
      ],
      providers: [MatDialogRef]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExternalAssetOwnerTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

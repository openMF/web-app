import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalAssetOwnerTabComponent } from './external-asset-owner-tab.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';

describe('ExternalAssetOwnerTabComponent', () => {
  let component: ExternalAssetOwnerTabComponent;
  let fixture: ComponentFixture<ExternalAssetOwnerTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExternalAssetOwnerTabComponent],
      imports: [
        RouterTestingModule,
        MatDialogModule,
        HttpClientModule
      ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: {
            close: () => {}
          }
        }
      ]
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

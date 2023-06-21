import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalAssetOwnerTabComponent } from './external-asset-owner-tab.component';

describe('ExternalAssetOwnerTabComponent', () => {
  let component: ExternalAssetOwnerTabComponent;
  let fixture: ComponentFixture<ExternalAssetOwnerTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExternalAssetOwnerTabComponent ]
    })
    .compileComponents();
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

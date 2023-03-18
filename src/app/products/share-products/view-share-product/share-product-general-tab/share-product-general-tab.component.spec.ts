import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareProductGeneralTabComponent } from './share-product-general-tab.component';

describe('ShareProductGeneralTabComponent', () => {
  let component: ShareProductGeneralTabComponent;
  let fixture: ComponentFixture<ShareProductGeneralTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShareProductGeneralTabComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareProductGeneralTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

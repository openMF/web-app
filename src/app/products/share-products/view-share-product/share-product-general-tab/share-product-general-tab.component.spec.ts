import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareProductGeneralTabComponent } from './share-product-general-tab.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('ShareProductGeneralTabComponent', () => {
  let component: ShareProductGeneralTabComponent;
  let fixture: ComponentFixture<ShareProductGeneralTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ShareProductGeneralTabComponent],
      imports: [RouterTestingModule]
    }).compileComponents();
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

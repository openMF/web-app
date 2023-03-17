import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareProductDatatableTabComponent } from './share-product-datatable-tab.component';

describe('ShareProductDatatableTabComponent', () => {
  let component: ShareProductDatatableTabComponent;
  let fixture: ComponentFixture<ShareProductDatatableTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShareProductDatatableTabComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareProductDatatableTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

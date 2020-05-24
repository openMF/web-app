import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareAccountTableComponent } from './share-account-table.component';

describe('ShareAccountTableComponent', () => {
  let component: ShareAccountTableComponent;
  let fixture: ComponentFixture<ShareAccountTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShareAccountTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareAccountTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

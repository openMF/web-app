import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FundMappingComponent } from './fund-mapping.component';

describe('FundMappingComponent', () => {
  let component: FundMappingComponent;
  let fixture: ComponentFixture<FundMappingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FundMappingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FundMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

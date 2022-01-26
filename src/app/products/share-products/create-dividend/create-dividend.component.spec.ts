import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CreateDividendComponent } from './create-dividend.component';

describe('CreateDividendComponent', () => {
  let component: CreateDividendComponent;
  let fixture: ComponentFixture<CreateDividendComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateDividendComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateDividendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

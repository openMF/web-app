import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OfficesComponent } from './offices.component';

describe('OfficesComponent', () => {
  let component: OfficesComponent;
  let fixture: ComponentFixture<OfficesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OfficesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OfficesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

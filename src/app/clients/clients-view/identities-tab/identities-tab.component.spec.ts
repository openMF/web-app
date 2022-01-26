import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { IdentitiesTabComponent } from './identities-tab.component';

describe('IdentitiesTabComponent', () => {
  let component: IdentitiesTabComponent;
  let fixture: ComponentFixture<IdentitiesTabComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ IdentitiesTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IdentitiesTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

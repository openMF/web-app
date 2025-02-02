import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommitteeTabComponent } from './committee-tab.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';

describe('CommitteeTabComponent', () => {
  let component: CommitteeTabComponent;
  let fixture: ComponentFixture<CommitteeTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CommitteeTabComponent],
      imports: [
        RouterTestingModule,
        HttpClientModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommitteeTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

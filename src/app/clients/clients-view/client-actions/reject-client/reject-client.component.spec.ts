import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectClientComponent } from './reject-client.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('RejectClientComponent', () => {
  let component: RejectClientComponent;
  let fixture: ComponentFixture<RejectClientComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RejectClientComponent],
      imports: [ReactiveFormsModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RejectClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

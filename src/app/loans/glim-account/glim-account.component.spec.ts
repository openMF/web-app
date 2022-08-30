import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlimAccountComponent } from './glim-account.component';

describe('GlimAccountComponent', () => {
  let component: GlimAccountComponent;
  let fixture: ComponentFixture<GlimAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GlimAccountComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GlimAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

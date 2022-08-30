import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GsimAccountComponent } from './gsim-account.component';

describe('GsimAccountComponent', () => {
  let component: GsimAccountComponent;
  let fixture: ComponentFixture<GsimAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GsimAccountComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GsimAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

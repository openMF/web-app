import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateGsimAccountComponent } from './create-gsim-account.component';

describe('CreateGsimAccountComponent', () => {
  let component: CreateGsimAccountComponent;
  let fixture: ComponentFixture<CreateGsimAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateGsimAccountComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateGsimAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

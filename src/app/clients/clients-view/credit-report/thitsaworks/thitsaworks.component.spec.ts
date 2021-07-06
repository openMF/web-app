import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThitsaworksComponent } from './thitsaworks.component';

describe('ThitsaworksComponent', () => {
  let component: ThitsaworksComponent;
  let fixture: ComponentFixture<ThitsaworksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThitsaworksComponent ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThitsaworksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

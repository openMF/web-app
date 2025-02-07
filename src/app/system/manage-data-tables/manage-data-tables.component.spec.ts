import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageDataTablesComponent } from './manage-data-tables.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { OverlayModule } from '@angular/cdk/overlay';

describe('ManageDataTablesComponent', () => {
  let component: ManageDataTablesComponent;
  let fixture: ComponentFixture<ManageDataTablesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ManageDataTablesComponent],
      imports: [
        OverlayModule
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' })
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageDataTablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

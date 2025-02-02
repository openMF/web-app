import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageDataTablesComponent } from './manage-data-tables.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('ManageDataTablesComponent', () => {
  let component: ManageDataTablesComponent;
  let fixture: ComponentFixture<ManageDataTablesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ManageDataTablesComponent],
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

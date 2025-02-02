import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewProvisioningJournalEntriesComponent } from './view-provisioning-journal-entries.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

describe('ViewProvisioningJournalEntriesComponent', () => {
  let component: ViewProvisioningJournalEntriesComponent;
  let fixture: ComponentFixture<ViewProvisioningJournalEntriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewProvisioningJournalEntriesComponent],
      imports: [RouterTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' }) // Proporciona los parámetros necesarios para ActivatedRoute
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewProvisioningJournalEntriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

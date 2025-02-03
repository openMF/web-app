import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupTransferClientsComponent } from './group-transfer-clients.component';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';

describe('GroupTransferClientsComponent', () => {
  let component: GroupTransferClientsComponent;
  let fixture: ComponentFixture<GroupTransferClientsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GroupTransferClientsComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        CommonModule
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' })
          }
        },
        DatePipe

      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupTransferClientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

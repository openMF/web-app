import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FamilyMembersTabComponent } from './family-members-tab.component';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

describe('FamilyMembersTabComponent', () => {
  let component: FamilyMembersTabComponent;
  let fixture: ComponentFixture<FamilyMembersTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FamilyMembersTabComponent],
      imports: [
        RouterTestingModule,
        ReactiveFormsModule,
        HttpClientModule,
        CommonModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FamilyMembersTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

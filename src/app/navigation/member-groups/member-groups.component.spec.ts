import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberGroupsComponent } from './member-groups.component';
import { TranslateFakeLoader, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';

describe('MemberGroupsComponent', () => {
  let component: MemberGroupsComponent;
  let fixture: ComponentFixture<MemberGroupsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MemberGroupsComponent],
      imports: [
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      providers: []
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MemberGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

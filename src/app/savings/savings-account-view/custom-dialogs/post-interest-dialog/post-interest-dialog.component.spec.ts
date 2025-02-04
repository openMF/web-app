import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostInterestDialogComponent } from './post-interest-dialog.component';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';

describe('PostInterestDialogComponent', () => {
  let component: PostInterestDialogComponent;
  let fixture: ComponentFixture<PostInterestDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PostInterestDialogComponent],
      imports: [
        MatDialogModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      providers: [
        { provide: MatDialogRef, useValue: {} }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostInterestDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

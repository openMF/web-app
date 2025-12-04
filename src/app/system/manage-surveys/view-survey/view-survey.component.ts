/** Angular Imports */
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

/** Custom Services */
import { SystemService } from 'app/system/system.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { TitleCasePipe } from '@angular/common';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * View Survey Component.
 */
@Component({
  selector: 'mifosx-view-survey',
  templateUrl: './view-survey.component.html',
  styleUrls: ['./view-survey.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    MatCardHeader,
    MatCardTitle,
    MatDivider,
    TitleCasePipe
  ]
})
export class ViewSurveyComponent {
  private route = inject(ActivatedRoute);
  private systemService = inject(SystemService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  /** Survey Data */
  surveyData: any;

  /** Columns shown in individual survey table */
  displayedColumns: string[] = [
    'text',
    'value'
  ];

  /**
   * Retrieves the survey data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {SystemService} systemService System Service.
   * @param {MatDialog} dialog Dialog Reference.
   * @param {Router} router Router for navigation.
   */
  constructor() {
    this.route.data.subscribe((data: { survey: any }) => {
      this.surveyData = data.survey;
    });
  }

  /** Go to edit survey page. */
  onEdit() {
    this.router.navigate(['./edit'], { relativeTo: this.route });
  }
}

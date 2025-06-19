import { Component, Input, OnInit } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { AlertService } from 'app/core/alert/alert.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { ExternalIdentifierPipe } from '../../pipes/external-identifier.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-external-identifier',
  templateUrl: './external-identifier.component.html',
  styleUrls: ['./external-identifier.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    ExternalIdentifierPipe
  ]
})
export class ExternalIdentifierComponent implements OnInit {
  @Input() externalId: string;
  @Input() completed = false;
  @Input() display = 'right';

  iconVisible = false;
  displayL = false;
  displayR = true;
  emptyValue = false;

  constructor(
    private clipboard: Clipboard,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.emptyValue = !this.externalId || this.externalId === '';
    this.displayL = this.display === 'left';
    this.displayR = this.display === 'right';
  }

  isLongValue(): boolean {
    if (this.externalId == null) {
      return false;
    }
    return this.externalId.length > 15;
  }

  showValue() {
    this.completed = !this.completed;
  }

  copyValue(): void {
    this.clipboard.copy(this.externalId);
    this.alertService.alert({ type: 'Clipboard', message: 'Copied: ' + this.externalId });
  }

  mouseEnter() {
    this.iconVisible = true;
  }

  mouseLeave() {
    this.iconVisible = false;
  }
}

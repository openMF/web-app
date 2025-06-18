import { Component, Input, OnInit } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { NgIf } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

@Component({
  selector: 'mifosx-entity-name',
  templateUrl: './entity-name.component.html',
  styleUrls: ['./entity-name.component.scss'],
  imports: [
    NgIf,
    FaIconComponent,
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class EntityNameComponent implements OnInit {
  @Input() entityName: string;
  @Input() display = 'right';

  iconVisible = false;
  displayL = false;
  displayR = true;

  constructor(private clipboard: Clipboard) {}

  ngOnInit(): void {
    this.displayL = this.display === 'left';
    this.displayR = this.display === 'right';
  }

  copyValue(): void {
    this.clipboard.copy(this.entityName);
  }

  mouseEnter() {
    this.iconVisible = true;
  }

  mouseLeave() {
    this.iconVisible = false;
  }
}

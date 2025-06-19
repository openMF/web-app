import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-svg-icon',
  templateUrl: './svg-icon.component.html',
  styleUrls: ['./svg-icon.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    NgClass
  ]
})
export class SvgIconComponent {
  @Input() iconFile: string;
  @Input() iconName: string;
  @Input() iconClass: string;
  @Input() iconWidth: string;

  constructor() {}
}

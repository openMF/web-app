/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { THR_ICONS, ThrIconNode, resolveThrIcon } from './thr-icon.paths';

@Component({
  selector: 'mifosx-thr-icon',
  standalone: true,
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      [attr.width]="pixelSize"
      [attr.height]="pixelSize"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      @for (node of nodes; track $index) {
        @if (node.el === 'path') {
          <path [attr.d]="node.d" [attr.fill]="node.fill || 'none'" />
        } @else if (node.el === 'circle') {
          <circle [attr.cx]="node.cx" [attr.cy]="node.cy" [attr.r]="node.r" [attr.fill]="node.fill || 'none'" />
        } @else if (node.el === 'rect') {
          <rect
            [attr.x]="node.x"
            [attr.y]="node.y"
            [attr.width]="node.width"
            [attr.height]="node.height"
            [attr.rx]="node.rx || 0"
          />
        }
      }
    </svg>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 0;
        flex-shrink: 0;
      }

      svg {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThrIconComponent {
  @Input() name: string | null | undefined = 'sparkles';
  @Input() size: number | string = 16;

  get pixelSize(): number {
    const value = Number(this.size);
    return Number.isFinite(value) && value > 0 ? value : 16;
  }

  get nodes(): ThrIconNode[] {
    const resolved = resolveThrIcon(this.name);
    return THR_ICONS[resolved] || THR_ICONS['sparkles'];
  }
}

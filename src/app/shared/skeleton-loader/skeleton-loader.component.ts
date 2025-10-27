import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'mifosx-skeleton-loader',
  templateUrl: './skeleton-loader.component.html',
  styleUrls: ['./skeleton-loader.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class SkeletonLoaderComponent {
  @Input() type: 'profile' | 'table' | 'list' | 'card' | 'custom' = 'profile';
  @Input() items: number = 1;
  @Input() cssClass: string = '';
  @Input() showButtons: boolean = true;
  @Input() buttonCount: number = 2;
  @Input() tableRows: number = 3;
  @Input() tableColumns: number = 2;

  trackByIndex(index: number): number {
    return index;
  }

  createArray(length: number): number[] {
    return Array.from({ length }, (_, i) => i);
  }
}

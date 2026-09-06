/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

/** Custom Services */
import { TemplatesService } from '../templates.service';
import { isHtmlText } from '../template-text.utils';
import { Template } from '../template.model';

/** Custom Components */
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * View Template Component.
 */
@Component({
  selector: 'mifosx-view-template',
  templateUrl: './view-template.component.html',
  styleUrls: ['./view-template.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewTemplateComponent {
  private route = inject(ActivatedRoute);
  private templatesService = inject(TemplatesService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);
  private sanitizer = inject(DomSanitizer);
  private changeDetector = inject(ChangeDetectorRef);

  /** Template Data */
  templateData: Template;

  /**
   * Text of an HTML template for the preview frame, null for plain text templates.
   * The text is trusted as authored because the frame is sandboxed: scripts never run in it, so Angular's HTML
   * sanitizer, which would strip the template's style sheets and inline styles, is not needed.
   */
  htmlPreview: SafeHtml | null = null;

  /** Re-fits the preview frame when its width changes, since wrapping changes the document height. */
  private previewResizeObserver?: ResizeObserver;

  /** Whether the template text is HTML markup (rendered) or plain text (shown verbatim). */
  get isHtml(): boolean {
    return this.htmlPreview !== null;
  }

  /**
   * Retrieves the template data from `resolve`.
   * @param {TemplateService} templateService Accounting Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {MatDialog} dialog Dialog reference.
   */
  constructor() {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { template: Template }) => {
      this.templateData = data.template;
      const text = this.templateData?.text;
      this.htmlPreview = isHtmlText(text) ? this.sanitizer.bypassSecurityTrustHtml(text) : null;
      // The router reuses this component when only the id changes, so the OnPush view must be told to update.
      this.changeDetector.markForCheck();
    });
    this.destroyRef.onDestroy(() => this.previewResizeObserver?.disconnect());
  }

  /**
   * Fits the preview frame to its document once it has loaded and keeps it fitted when its width changes.
   * @param {HTMLIFrameElement} frame Preview frame.
   */
  onPreviewLoad(frame: HTMLIFrameElement): void {
    this.fitPreview(frame);
    this.previewResizeObserver?.disconnect();
    if (typeof ResizeObserver === 'undefined') {
      return;
    }
    let width = frame.clientWidth;
    this.previewResizeObserver = new ResizeObserver(() => {
      if (frame.clientWidth !== width) {
        width = frame.clientWidth;
        this.fitPreview(frame);
      }
    });
    this.previewResizeObserver.observe(frame);
  }

  /**
   * Gives the preview frame the height of its document so the whole template shows without an inner scrollbar.
   * The frame is collapsed first because a document never reports a scroll height below its viewport height.
   * @param {HTMLIFrameElement} frame Preview frame.
   */
  fitPreview(frame: HTMLIFrameElement): void {
    const previewDocument = frame.contentDocument;
    const root = previewDocument?.documentElement;
    if (!root) {
      return;
    }
    frame.style.height = '0';
    const height = Math.max(root.scrollHeight, previewDocument.body?.scrollHeight ?? 0);
    frame.style.height = `${height}px`;
    // A template wider than the frame gets a horizontal scrollbar, which takes room from the viewport.
    // Leave space for it so a vertical scrollbar does not appear as well.
    const scrollbarHeight = (frame.contentWindow?.innerHeight ?? root.clientHeight) - root.clientHeight;
    if (scrollbarHeight > 0) {
      frame.style.height = `${height + scrollbarHeight}px`;
    }
  }

  /**
   * Deletes the template and redirects to templates.
   */
  delete() {
    const deleteTemplateDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `template ${this.templateData.id}` }
    });
    deleteTemplateDialogRef.afterClosed().subscribe((response: any) => {
      if (response?.delete) {
        this.templatesService.deleteTemplate(String(this.templateData.id)).subscribe(() => {
          this.router.navigate(['/templates']);
        });
      }
    });
  }
}

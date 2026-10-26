/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatSidenav } from '@angular/material/sidenav';
import { TranslateModule } from '@ngx-translate/core';
import { describe, it, expect, beforeEach } from '@jest/globals';

import { ShellComponent } from './shell.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { ContentComponent } from './content/content.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { ProgressBarService } from '../progress-bar/progress-bar.service';

/* The shell's children each pull in the whole application dependency tree.
   Stubbing them keeps the real shell template, and therefore the real progress
   bar condition, while leaving the rest out of the way. */
@Component({ selector: 'mifosx-sidenav', template: '' })
class StubSidenavComponent {
  @Input() sidenavCollapsed = true;
}

@Component({ selector: 'mifosx-toolbar', template: '' })
class StubToolbarComponent {
  @Input() sidenav: MatSidenav;
  @Output() collapse = new EventEmitter<boolean>();
}

@Component({ selector: 'mifosx-breadcrumb', template: '' })
class StubBreadcrumbComponent {}

@Component({ selector: 'mifosx-content', template: '' })
class StubContentComponent {}

@Component({ selector: 'mifosx-footer', template: '' })
class StubFooterComponent {
  @Input() styleClass = '';
}

describe('ShellComponent — progress bar visibility', () => {
  let component: ShellComponent;
  let fixture: ComponentFixture<ShellComponent>;
  let progressBarService: ProgressBarService;

  /** The animated bar rendered by the shell while a request is in flight. */
  const loadingBar = () => fixture.nativeElement.querySelector('.loading');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ShellComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        ProgressBarService,
        provideAnimationsAsync(),
        provideRouter([])
      ]
    })
      .overrideComponent(ShellComponent, {
        remove: {
          imports: [
            SidenavComponent,
            ToolbarComponent,
            BreadcrumbComponent,
            ContentComponent,
            FooterComponent
          ]
        },
        add: {
          imports: [
            StubSidenavComponent,
            StubToolbarComponent,
            StubBreadcrumbComponent,
            StubContentComponent,
            StubFooterComponent
          ]
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(ShellComponent);
    component = fixture.componentInstance;
    progressBarService = TestBed.inject(ProgressBarService);
    fixture.detectChanges();
  });

  it('does not render the loading bar before any request has started', () => {
    // Left uninitialised this was undefined, which is not 'none', so the bar was
    // rendered on every route that issues no request of its own.
    expect(component.progressBarMode).toBe('none');
    expect(loadingBar()).toBeNull();
  });

  it('renders the loading bar while a request is running', () => {
    progressBarService.increase();
    fixture.detectChanges();

    expect(component.progressBarMode).toBe('indeterminate');
    expect(loadingBar()).not.toBeNull();
  });

  it('removes the loading bar once the last request finishes', () => {
    progressBarService.increase();
    fixture.detectChanges();
    expect(loadingBar()).not.toBeNull();

    progressBarService.decrease();
    fixture.detectChanges();

    expect(component.progressBarMode).toBe('none');
    expect(loadingBar()).toBeNull();
  });

  it('keeps the loading bar rendered until every concurrent request finishes', () => {
    progressBarService.increase();
    progressBarService.increase();
    progressBarService.decrease();
    fixture.detectChanges();

    expect(loadingBar()).not.toBeNull();

    progressBarService.decrease();
    fixture.detectChanges();

    expect(loadingBar()).toBeNull();
  });
});

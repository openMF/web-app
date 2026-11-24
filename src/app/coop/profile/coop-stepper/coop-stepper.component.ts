/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, ViewChild, effect, inject } from '@angular/core';

import { toSignal } from '@angular/core/rxjs-interop';

import { CommonModule } from '@angular/common';

import { ActivatedRoute, Router } from '@angular/router';

import { StepperSelectionEvent } from '@angular/cdk/stepper';

import { MatStepper, MatStepperModule } from '@angular/material/stepper';

import { MatButtonModule } from '@angular/material/button';

import { MatIconModule } from '@angular/material/icon';

import { injectQuery } from '@tanstack/angular-query-experimental';

import { CoopNavbarComponent } from '../../coop-navbar/coop-navbar.component';

import { CoopProfileComponent } from '../coop-profile/coop-profile.component';

import { CoopDocumentsComponent } from '../coop-profile/coop-documents/coop-documents.component';

import { CoopSystemStatusComponent } from '../coop-system-status/coop-system-status.component';

import { CoopProfileService } from '../../services/coop-profile.service';

import { statusQueryOptions } from '../../queries/coop-profile.queries';

interface CoopStepperStep {
  label: string;

  title: string;

  subtitle: string;
}

@Component({
  selector: 'mifosx-coop-stepper',

  standalone: true,

  imports: [
    CommonModule,
    MatStepperModule,
    MatButtonModule,
    MatIconModule,
    CoopNavbarComponent,
    CoopProfileComponent,
    CoopDocumentsComponent,
    CoopSystemStatusComponent
  ],

  templateUrl: './coop-stepper.component.html',

  styleUrl: './coop-stepper.component.scss'
})
export class CoopStepperComponent {
  // =====================================================
  // CHILD REFERENCES
  // =====================================================

  @ViewChild('stepper')
  stepper!: MatStepper;

  /**
   * Read-only reference used solely to mirror `profileStatus` (the
   * "PENDING"/"ACTIVE" badge) into the step-indicator row so it sits
   * level with the indicator instead of on its own row further down.
   * mat-step content is lazy-rendered but the first step is active by
   * default, so this resolves as soon as the view initializes.
   */
  @ViewChild(CoopProfileComponent)
  profileComponent?: CoopProfileComponent;

  // =====================================================
  // ACTIVATION WELCOME (ACTIVE / PROVISIONED)
  // =====================================================

  private coopProfileService = inject(CoopProfileService);

  private statusQuery = injectQuery(() => statusQueryOptions(this.coopProfileService));

  private route = inject(ActivatedRoute);

  private router = inject(Router);

  /**
   * `?view=general` on this same route is what the navbar's "Profile"
   * link uses to land straight on the General Information step; its
   * absence (the navbar's "Home" link, or the logo/title) means "show
   * the welcome page when ACTIVE/PROVISIONED". Reading it as a signal -
   * instead of a one-off snapshot - is what lets clicking those navbar
   * links work even though they all resolve to this same
   * route/component instance (Angular reuses it rather than
   * re-creating it).
   */
  private queryParamMap = toSignal(this.route.queryParamMap);

  /**
   * Full-page welcome screen, shown in place of the stepper for
   * ACTIVE (the "Congratulations" sign-in details) and PROVISIONED
   * (the existing "your system is being prepared" message) - the
   * cooperative's own home page while its system isn't something they
   * can act on yet. PENDING keeps its existing status card embedded
   * inline in CoopProfileComponent instead - this flag never applies
   * to it. Derived entirely from `statusQuery` + the `view` query
   * param so the navbar links and the welcome page's own Next/Back
   * stay in sync with each other.
   */
  showActivationWelcome = false;

  // =====================================================
  // ONBOARDING WELCOME (NO_PROFILE ONLY, FIRST LOGIN)
  // =====================================================

  /**
   * Persisted (not just in-memory) so the "Welcome to GroFiniX" page never
   * shows again once dismissed - a NO_PROFILE user who closes the tab
   * mid-form and logs back in still has status NO_PROFILE from the
   * server, so the query-param trick used for `showActivationWelcome`
   * isn't enough here; only actually submitting the profile changes
   * the server-side status away from NO_PROFILE.
   */
  private readonly onboardingDismissedKeyPrefix = 'coopOnboardingWelcomeDismissed:';

  private isOnboardingDismissed(email: string): boolean {
    return localStorage.getItem(this.onboardingDismissedKeyPrefix + email) === 'true';
  }

  private markOnboardingDismissed(email: string): void {
    localStorage.setItem(this.onboardingDismissedKeyPrefix + email, 'true');
  }

  /**
   * Full-page "Welcome to GroFiniX" onboarding, shown in place of the
   * stepper on a NO_PROFILE user's first login only - reuses
   * `CoopSystemStatusComponent`'s existing NO_PROFILE case rather than
   * a new component/step (see the template).
   */
  showOnboardingWelcome = false;

  constructor() {
    effect(() => {
      const data = this.statusQuery.data();
      const forcedToGeneral = this.queryParamMap()?.get('view') === 'general';

      const isActiveOrProvisioned = data?.status === 'ACTIVE' || data?.status === 'PROVISIONED';

      this.showActivationWelcome = isActiveOrProvisioned && !forcedToGeneral;

      const isNoProfile = data?.status === 'NO_PROFILE';
      const dismissed = !!data?.email && this.isOnboardingDismissed(data.email);

      this.showOnboardingWelcome = isNoProfile && !dismissed && !forcedToGeneral;
    });
  }

  /**
   * "Get Started" on the onboarding welcome page moves into the
   * profile stepper - and permanently dismisses the welcome page for
   * this user (see `markOnboardingDismissed`), since a fresh
   * NO_PROFILE profile is otherwise indistinguishable, server-side,
   * from one whose onboarding was never started.
   */
  onOnboardingGetStarted(): void {
    const email = this.statusQuery.data()?.email;

    if (email) {
      this.markOnboardingDismissed(email);
    }

    this.showOnboardingWelcome = false;
  }

  /**
   * "Next" on the welcome screen (ACTIVE or PROVISIONED) moves into
   * the profile stepper by setting `?view=general` on the current
   * route (see `queryParamMap` above) rather than a plain field
   * assignment, so a later click on the navbar's "Home" link - same
   * route, no `view` param - reliably brings the welcome page back
   * even though the URL path never changes.
   */
  onActivationWelcomeNext(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { view: 'general' },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  /**
   * "Back" from the General Information step - only reachable when
   * ACTIVE (see CoopProfileComponent's Back button) - clears `view` so
   * the welcome screen shows again instead of leaving the stepper.
   */
  onGeneralInfoPrevious(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { view: null },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  // =====================================================
  // STEPS
  // =====================================================

  /**
   * Drives the custom step-indicator bar rendered under the shared
   * navbar (Material's own step header is hidden - see the component
   * stylesheet - since it was rendering above the navbar instead of
   * below it).
   */
  readonly steps: CoopStepperStep[] = [
    {
      label: 'General Information',
      title: 'Cooperative Profile',
      subtitle: "Manage your cooperative's registration and contact information."
    },
    {
      label: 'Documents',
      title: 'Cooperative Documents',
      subtitle: 'Upload and manage your cooperative documents.'
    }
  ];

  currentStepIndex = 0;

  get currentStep(): CoopStepperStep {
    return this.steps[this.currentStepIndex];
  }

  // =====================================================
  // STEP COMPLETION
  // =====================================================

  /**
   * Drives `mat-step[completed]` for General Information. Stays false
   * until the profile save actually succeeds, and combined with the
   * stepper's `linear` mode this is what stops the user from clicking
   * straight into the Documents step header to skip validation.
   */
  generalInfoCompleted = false;

  // =====================================================
  // STEP CHANGE
  // =====================================================

  onSelectionChange(event: StepperSelectionEvent): void {
    this.currentStepIndex = event.selectedIndex;
  }

  // =====================================================
  // INDICATOR CLICK
  // =====================================================

  /**
   * Only lets the indicator jump to the current step or one already
   * completed - moving forward always goes through "Next", so its
   * validation/save gate can never be skipped by clicking ahead.
   */
  goToStep(index: number): void {
    if (index > this.currentStepIndex) {
      return;
    }

    this.stepper.selectedIndex = index;
  }

  // =====================================================
  // NEXT: GENERAL INFORMATION -> DOCUMENTS
  // =====================================================

  /**
   * CoopProfileComponent's own "Next" button (next to its Save/Update
   * button) does the required-field validation and the actual
   * create/update API call, then emits `nextStep` only once that
   * succeeds - this just advances the stepper in response, no
   * validation or save logic is duplicated here.
   *
   * `generalInfoCompleted` still drives the `[completed]` template
   * binding (for the indicator/header), but that binding only reaches
   * the actual `mat-step` on Angular's *next* change-detection pass -
   * not synchronously. `stepper.next()` (CDK's `selectedIndex` setter,
   * in linear mode) checks the step's *current* `completed` value in
   * this same synchronous call, so setting only the template-bound
   * property left it reading the stale `false` and silently no-op'd on
   * the first click - the actual root cause of the two-click bug.
   * Setting `completed` directly on the CDK step instance below writes
   * straight to its internal signal, so `stepper.next()` sees the
   * correct value immediately, in the same tick.
   */
  onGeneralInfoNext(): void {
    this.generalInfoCompleted = true;

    const generalInfoStep = this.stepper.steps.toArray()[0];

    if (generalInfoStep) {
      generalInfoStep.completed = true;
    }

    this.stepper.next();
  }
}

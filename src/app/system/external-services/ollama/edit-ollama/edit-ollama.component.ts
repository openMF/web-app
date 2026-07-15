/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { SettingsService } from 'app/settings/settings.service';
import { OllamaService } from 'app/shared/services/ollama.service';
import { AlertService } from 'app/core/alert/alert.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'mifosx-edit-ollama',
  templateUrl: './edit-ollama.component.html',
  styleUrls: ['./edit-ollama.component.scss'],
  standalone: true,
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatSlideToggleModule,
    MatButtonModule,
    //FaIconComponent,
    RouterLink
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditOllamaComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private settingsService = inject(SettingsService);
  private ollamaService = inject(OllamaService);
  private alertService = inject(AlertService);
  private translateService = inject(TranslateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ollamaForm: FormGroup<{
    enabled: FormControl<boolean>;
    url: FormControl<string>;
    model: FormControl<string>;
  }>;
  availableModels: string[] = [];

  ngOnInit(): void {
    this.ollamaForm = this.formBuilder.group({
      enabled: [this.settingsService.ollamaEnabled],
      url: [
        this.settingsService.ollamaUrl,
        []
      ],
      model: [this.settingsService.ollamaModel]
    });
    this.syncUrlValidators(this.ollamaForm.value.enabled);
    this.ollamaForm.get('enabled').valueChanges.subscribe((enabled: boolean) => {
      this.syncUrlValidators(enabled);
    });
    if (this.settingsService.ollamaUrl) {
      this.loadModels(this.settingsService.ollamaUrl);
    }
  }

  private syncUrlValidators(enabled: boolean): void {
    const urlCtrl = this.ollamaForm.get('url');
    const modelCtrl = this.ollamaForm.get('model');
    if (enabled) {
      urlCtrl.setValidators([Validators.required]);
      urlCtrl.enable({ emitEvent: false });
      modelCtrl.enable({ emitEvent: false });
    } else {
      urlCtrl.clearValidators();
      urlCtrl.disable({ emitEvent: false });
      modelCtrl.disable({ emitEvent: false });
    }
    urlCtrl.updateValueAndValidity({ emitEvent: false });
  }

  loadModels(url?: string): void {
    const target = url ?? this.ollamaForm.get('url').value;
    if (!target) return;
    this.ollamaService.listModelsFromUrl(target).subscribe((models) => {
      this.availableModels = models;
      this.cdr.markForCheck();
    });
  }

  testConnection(): void {
    const url = this.ollamaForm.get('url').value;
    if (!url) return;
    this.ollamaService.checkConnectionAt(url).subscribe((ok) => {
      if (ok) {
        this.alertService.alert({
          type: 'AI API',
          message: this.translateService.instant('labels.text.AI API connection successful')
        });
        this.loadModels(url);
      } else {
        this.alertService.alert({
          type: 'AI API Error',
          message: this.translateService.instant('labels.text.AI API connection failed')
        });
      }
    });
  }

  submit(): void {
    if (this.ollamaForm.invalid) return;
    this.settingsService.setOllamaEnabled(this.ollamaForm.value.enabled ?? false);
    this.settingsService.setOllamaUrl(this.ollamaForm.getRawValue().url ?? '');
    this.settingsService.setOllamaModel(this.ollamaForm.getRawValue().model ?? '');
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}

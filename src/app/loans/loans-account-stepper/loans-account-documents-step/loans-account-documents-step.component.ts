/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatStepperNext, MatStepperPrevious } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { ClientsService, UploadLimits } from 'app/clients/clients.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

export interface LoanApplicationDocument {
  file: File;
  name: string;
  description: string;
}

/**
 * Supporting documents for the application. A loan's documents can only be added once the loan exists
 * (`POST /loans/{id}/documents`), so they are kept here and uploaded right after the application is submitted.
 * Files over the server's document limit are refused here, before the loan is created without them.
 */
@Component({
  selector: 'mifosx-loans-account-documents-step',
  templateUrl: './loans-account-documents-step.component.html',
  styleUrls: ['./loans-account-documents-step.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatIcon,
    MatIconButton,
    MatStepperPrevious,
    MatStepperNext,
    FaIconComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoansAccountDocumentsStepComponent {
  private formBuilder = inject(FormBuilder);

  readonly limits = signal<UploadLimits | null>(null);
  readonly tooBig = signal<string[]>([]);
  readonly form: FormArray<FormGroup> = this.formBuilder.array<FormGroup>([]);
  private files: File[] = [];

  constructor() {
    inject(ClientsService)
      .getUploadLimits()
      .subscribe((limits) => this.limits.set(limits));
  }

  addFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    const maxBytes = this.limits()?.documentMaxFileSizeBytes;
    const refused: string[] = [];
    Array.from(input.files ?? []).forEach((file) => {
      if (maxBytes && file.size > maxBytes) {
        refused.push(file.name);
        return;
      }
      this.files.push(file);
      this.form.push(
        this.formBuilder.group({
          name: [
            file.name.replace(/\.[^.]+$/, '').slice(0, 250),
            [
              Validators.required,
              Validators.maxLength(250)
            ]
          ],
          description: [
            '',
            Validators.maxLength(1000)
          ]
        })
      );
    });
    this.tooBig.set(refused);
    // The same file can be picked again after it is removed.
    input.value = '';
  }

  fileName(index: number): string {
    return this.files[index].name;
  }

  remove(index: number): void {
    this.files.splice(index, 1);
    this.form.removeAt(index);
  }

  get documents(): LoanApplicationDocument[] {
    return this.form.controls.map((group, i) => ({
      file: this.files[i],
      name: group.value.name.trim(),
      description: group.value.description?.trim() ?? ''
    }));
  }
}

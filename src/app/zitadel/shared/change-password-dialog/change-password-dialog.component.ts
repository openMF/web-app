import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogActions } from '@angular/material/dialog';
import { UntypedFormBuilder, Validators, AbstractControl, ValidationErrors, FormGroup } from '@angular/forms';
import { confirmPasswordValidator } from 'app/login/reset-password/confirm-password.validator';
import { HttpClient } from '@angular/common/http';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { environment } from '../../../../environments/environment';

/**
 * Change Password Dialog component.
 */
@Component({
  selector: 'mifosx-change-password-dialog',
  templateUrl: './change-password-dialog.component.html',
  styleUrls: ['./change-password-dialog.component.scss'],
  standalone: true,
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogActions
  ]
})
export class ChangePasswordDialogComponent implements OnInit {
  minPasswordLength: number = environment.minPasswordLength || 12;
  changePasswordForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<ChangePasswordDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: UntypedFormBuilder,
    private http: HttpClient
  ) {}

  private api = environment.OIDC.oidcApiUrl;

  ngOnInit(): void {
    this.createChangePasswordForm();
    this.setupPasswordMatchValidation();
  }

  createChangePasswordForm(): void {
    this.changePasswordForm = this.formBuilder.group(
      {
        currentPassword: [
          '',
          Validators.required
        ],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(this.minPasswordLength),
            Validators.maxLength(50),
            Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)]
        ],
        repeatPassword: [
          '',
          Validators.required
        ]
      },
      { validators: confirmPasswordValidator }
    );
  }

  setupPasswordMatchValidation(): void {
    this.changePasswordForm.get('password')?.valueChanges.subscribe(() => {
      this.changePasswordForm.get('repeatPassword')?.updateValueAndValidity();
    });

    this.changePasswordForm.get('repeatPassword')?.setValidators([
      Validators.required,
      this.matchOtherControl('password')]);
  }

  matchOtherControl(controlNameToMatch: string) {
    return (control: AbstractControl): ValidationErrors | null => {
      const parent = control?.parent;
      if (!parent) return null;

      const matchingControl = parent.get(controlNameToMatch);
      if (!matchingControl) return null;

      return control.value === matchingControl.value ? null : { notequal: true };
    };
  }

  onSubmit(): void {
    if (this.changePasswordForm.invalid) return;

    const requestBody = {
      userId: this.data.id,
      currentPassword: this.changePasswordForm.value.currentPassword,
      newPassword: {
        password: this.changePasswordForm.value.password,
        changeRequired: false
      }
    };

    console.log('JSON a enviar:', requestBody);

    this.http.put(this.api + 'authentication/user/password', requestBody).subscribe({
      next: (res) => {
        //console.log('Contraseña actualizada', res);
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.log(err);
        alert(err + 'No es posible actualizar contraseña');
      }
    });
  }
}

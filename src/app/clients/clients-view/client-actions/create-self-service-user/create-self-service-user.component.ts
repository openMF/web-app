/** Angular Imports. */
import { Component, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  UntypedFormControl,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

/** Client Services. */
import { ClientsService } from 'app/clients/clients.service';
import { PasswordsUtility } from 'app/core/utils/passwords-utility';

@Component({
  selector: 'mifosx-create-self-service-user',
  templateUrl: './create-self-service-user.component.html',
  styleUrls: ['./create-self-service-user.component.scss']
})
export class CreateSelfServiceUserComponent implements OnInit {
  createSelfServiceForm: UntypedFormGroup;
  clientData: any;
  hidePasswordField = true;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private clientService: ClientsService,
    private router: Router,
    private passwordsUtility: PasswordsUtility
  ) {
    this.route.data.subscribe((data: { clientActionData: any }) => {
      this.clientData = data.clientActionData;
    });
  }

  ngOnInit(): void {
    this.createSelfServiceUser();
    this.sendPasswordToEmailChange();
  }

  /**
   * Send Password To Email Change.
   */
  sendPasswordToEmailChange() {
    this.createSelfServiceForm.controls.sendPasswordToEmail.valueChanges.subscribe((value: any) => {
      if (value === true) {
        this.hidePasswordField = true;
        this.createSelfServiceForm.removeControl('password');
        this.createSelfServiceForm.removeControl('repeatPassword');
      } else {
        this.hidePasswordField = false;
        this.createSelfServiceForm.addControl(
          'password',
          new UntypedFormControl('', this.passwordsUtility.getPasswordValidators())
        );
        this.createSelfServiceForm.addControl(
          'repeatPassword',
          new UntypedFormControl('', [
            Validators.required,
            this.passwordsUtility.confirmPassword('password')])
        );
      }
    });
  }

  /**
   * Create Self User Form.
   */
  createSelfServiceUser() {
    this.createSelfServiceForm = this.formBuilder.group({
      username: new UntypedFormControl('', [Validators.required]),
      firstname: new UntypedFormControl(this.clientData.firstname, [Validators.required]),
      lastname: new UntypedFormControl(this.clientData.lastname, [Validators.required]),
      email: new UntypedFormControl('', [
        Validators.required,
        Validators.email
      ]),
      sendPasswordToEmail: new UntypedFormControl(true),
      passwordNeverExpires: new UntypedFormControl(false),
      status: new UntypedFormControl({
        value: this.clientData.subStatus.active ? 'Active' : 'Inactive',
        disabled: true
      })
    });
  }

  /**
   * Submit form.
   */
  submit() {
    if (!this.createSelfServiceForm.get('passwordNeverExpires').value) {
      this.createSelfServiceForm.removeControl('passwordNeverExpires');
    }
    const clientId = this.clientData.id.toString();
    const selfServiceForm = this.createSelfServiceForm.value;
    (selfServiceForm.roles = [2]), (selfServiceForm.isSelfServiceUser = true);
    selfServiceForm.staffId = this.clientData.staffId;
    selfServiceForm.clients = [clientId];
    selfServiceForm.officeId = this.clientData.officeId;
    this.clientService.createSelfServiceUser(selfServiceForm).subscribe(() => {
      this.router.navigate(['../../general'], { relativeTo: this.route });
    });
  }
}

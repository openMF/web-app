/** Angular Imports */
import { Component, Inject, OnInit, AfterViewInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

/** Custom Services */
import { ClientsService } from 'app/clients/clients.service';
import { AccountTransfersService } from '../../account-transfers.service';

/**
 * Add Client Transfer Dialog component.
 */
@Component({
  selector: 'mifosx-add-client-transfer-dialog',
  templateUrl: './add-client-transfer-dialog.component.html'
})
export class AddClientTransferDialogComponent implements OnInit, AfterViewInit {
  /** Add Client Transfer form. */
  addClientTransferForm: UntypedFormGroup;
  /** Clients Data */
  clientsData: any;
  /** To Office Type Data */
  toOfficeTypeData: any;
  /** To Client Type Data */
  toClientTypeData: any;
  /** To Account Type Data */
  toAccountTypeData: any;
  /** To Account Data */
  toAccountData: any;
  /** To Office ID */
  toOfficeId: any;
  /** Account Type ID */
  accountTypeId: any;
  /** Source Account ID */
  id: any;
  /** Initial Account Transfers Template Data */
  initialAccountTransfersTemplateData: any;

  /**
   * @param {MatDialogRef} dialogRef Component reference to dialog.
   * @param {UntypedFormBuilder} formBuilder Form Builder.
   * @param {ClientsService} clientsService Clients Service.
   * @param {AccountTransfersService} accountTransfersService Account Transfers Service.
   * @param {any} data Dialog data.
   */
  constructor(
    public dialogRef: MatDialogRef<AddClientTransferDialogComponent>,
    private formBuilder: UntypedFormBuilder,
    private clientsService: ClientsService,
    private accountTransfersService: AccountTransfersService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // Debug: Vérifier les données reçues
    console.log('Modal received data:', data);

    this.toOfficeTypeData = data.toOfficeTypeData;
    this.toAccountTypeData = data.toAccountTypeData;
    this.toAccountData = data.toAccountData;
    this.clientsData = data.clientsData || [];
    this.toOfficeId = data.toOfficeId;
    this.accountTypeId = data.accountTypeId;
    this.id = data.id;
    this.initialAccountTransfersTemplateData = data.initialAccountTransfersTemplateData;

    // Si les données sont vides, utiliser les données initiales
    if (!this.toAccountData || this.toAccountData.length === 0) {
      if (this.initialAccountTransfersTemplateData && this.initialAccountTransfersTemplateData.toAccountOptions) {
        this.toAccountData = this.initialAccountTransfersTemplateData.toAccountOptions;
        console.log('Using initial account data:', this.toAccountData);
      }
    }

    if (!this.toAccountTypeData || this.toAccountTypeData.length === 0) {
      if (this.initialAccountTransfersTemplateData && this.initialAccountTransfersTemplateData.toAccountTypeOptions) {
        this.toAccountTypeData = this.initialAccountTransfersTemplateData.toAccountTypeOptions;
        console.log('Using initial account type data:', this.toAccountTypeData);
      }
    }

    // Debug: Vérifier les données assignées
    console.log('Modal assigned data:');
    console.log('toAccountTypeData:', this.toAccountTypeData);
    console.log('toAccountData:', this.toAccountData);
    console.log('clientsData:', this.clientsData);
  }

  ngOnInit() {
    this.createAddClientTransferForm();

    // Debug: Vérifier l'état initial des données
    console.log('Modal ngOnInit - Initial state:');
    console.log('toOfficeId:', this.toOfficeId);
    console.log('accountTypeId:', this.accountTypeId);
    console.log('id:', this.id);
    console.log('toAccountData length:', this.toAccountData ? this.toAccountData.length : 'undefined');
    console.log('toAccountTypeData length:', this.toAccountTypeData ? this.toAccountTypeData.length : 'undefined');

    // Si nous avons toutes les données nécessaires, charger les comptes immédiatement
    if (this.toOfficeId && this.id && this.accountTypeId) {
      this.loadInitialAccounts();
    }
  }

  /**
   * Loads initial accounts when modal opens
   */
  loadInitialAccounts() {
    console.log('Loading initial accounts...');
    const formValue = this.refineObject({
      toOfficeId: this.toOfficeId
    });

    this.accountTransfersService
      .newAccountTranferResource(this.id, this.accountTypeId, formValue)
      .subscribe((response: any) => {
        this.toAccountTypeData = response.toAccountTypeOptions;
        this.toAccountData = response.toAccountOptions;
        console.log('Initial accounts loaded:', this.toAccountData);
      }, (error: any) => {
        console.error('Error loading initial accounts:', error);
      });
  }

  /**
   * Creates the add client transfer form.
   */
  createAddClientTransferForm() {
    this.addClientTransferForm = this.formBuilder.group({
      toOfficeId: ['', Validators.required],
      toClientId: ['', Validators.required],
      toAccountType: ['', Validators.required],
      toAccountId: ['', Validators.required],
      transferAmount: ['', [Validators.required, Validators.min(0.01)]]
    });

    // Si on est en mode édition, pré-remplir le formulaire
    if (this.data.client) {
      console.log('Editing client transfer:', this.data.client);

      // Pour l'édition, nous devons trouver l'objet client complet
      const clientId = this.data.client.toClientId;
      const client = this.clientsData.find((c: any) => c.id === clientId);

      if (client) {
        console.log('Found client object:', client);
        this.addClientTransferForm.patchValue({
          ...this.data.client,
          toClientId: client // Passer l'objet client complet
        });
      } else {
        console.log('Client not found in clientsData, creating mock client object');
        // Créer un objet client mock basé sur les données disponibles
        const mockClient = {
          id: clientId,
          displayName: this.data.client.toClientName || clientId
        };
        this.addClientTransferForm.patchValue({
          ...this.data.client,
          toClientId: mockClient
        });
      }
    }
  }


  /**
   * Forces reload of accounts if they are empty
   */
  ensureAccountsLoaded() {
    if ((!this.toAccountData || this.toAccountData.length === 0) && this.toOfficeId && this.id && this.accountTypeId) {
      console.log('Accounts are empty, forcing reload...');
      this.loadInitialAccounts();
    }
  }

  /**
   * Reloads accounts with current form values
   */
  reloadAccountsWithCurrentValues() {
    const currentClient = this.addClientTransferForm.controls.toClientId.value;
    const currentAccountType = this.addClientTransferForm.controls.toAccountType.value;

    if (this.toOfficeId && this.id && this.accountTypeId) {
      console.log('Reloading accounts with current values...');

      const formValue: any = {
        toOfficeId: this.toOfficeId
      };

      // Ajouter le client si c'est un objet
      if (currentClient && typeof currentClient === 'object') {
        formValue.toClientId = currentClient;
      }

      // Ajouter le type de compte s'il est sélectionné
      if (currentAccountType) {
        formValue.toAccountType = currentAccountType;
      }

      const refinedFormValue = this.refineObject(formValue);

      this.accountTransfersService
        .newAccountTranferResource(this.id, this.accountTypeId, refinedFormValue)
        .subscribe((response: any) => {
          this.toAccountData = response.toAccountOptions;
          console.log('Accounts reloaded with current values:', this.toAccountData);
        }, (error: any) => {
          console.error('Error reloading accounts with current values:', error);
        });
    }
  }

  /**
   * Subscribes to Clients search filter and Account Type changes:
   */
  ngAfterViewInit() {
    // Ensure accounts are loaded after view init
    setTimeout(() => {
      this.ensureAccountsLoaded();
    }, 100);

    // Also try to reload with current values after a longer delay
    setTimeout(() => {
      this.reloadAccountsWithCurrentValues();
    }, 500);
    // Client search and change event (same logic as normal component)
    this.addClientTransferForm.controls.toClientId.valueChanges.subscribe((value: any) => {
      console.log('Client value changed:', value);

      // Si la valeur est une string (recherche), faire la recherche
      if (typeof value === 'string' && value.length >= 2) {
        this.clientsService.getFilteredClients('displayName', 'ASC', true, value).subscribe((data: any) => {
          this.clientsData = data.pageItems;
          console.log('Clients search results:', this.clientsData);
        });
      }
      // Si la valeur est un objet (sélection), recharger les comptes comme dans le composant normal
      else if (typeof value === 'object' && value !== null) {
        console.log('Client selected, reloading accounts...');

        // Inclure aussi le type de compte sélectionné si disponible
        const currentAccountType = this.addClientTransferForm.controls.toAccountType.value;
        const formValue: any = {
          toOfficeId: this.toOfficeId,
          toClientId: value
        };

        // Ajouter le type de compte s'il est sélectionné
        if (currentAccountType) {
          formValue.toAccountType = currentAccountType;
        }

        const refinedFormValue = this.refineObject(formValue);

        this.accountTransfersService
          .newAccountTranferResource(this.id, this.accountTypeId, refinedFormValue)
          .subscribe((response: any) => {
            this.toAccountData = response.toAccountOptions;
            console.log('Accounts reloaded for client:', value.displayName, this.toAccountData);
          }, (error: any) => {
            console.error('Error reloading accounts for client:', error);
          });
      }
    });

    // Office change - reload clients and accounts
    this.addClientTransferForm.controls.toOfficeId.valueChanges.subscribe((officeId: any) => {
      console.log('Office changed:', officeId);

      if (officeId && this.id && this.accountTypeId) {
        console.log('Reloading data for office...');

        const formValue: any = {
          toOfficeId: officeId
        };

        const refinedFormValue = this.refineObject(formValue);

        this.accountTransfersService
          .newAccountTranferResource(this.id, this.accountTypeId, refinedFormValue)
          .subscribe((response: any) => {
            this.toClientTypeData = response.toClientOptions;
            this.toAccountTypeData = response.toAccountTypeOptions;
            this.toAccountData = response.toAccountOptions;
            // Reset selections when office changes
            this.addClientTransferForm.patchValue({
              toClientId: '',
              toAccountType: '',
              toAccountId: ''
            });
            console.log('Data reloaded for office:', officeId);
          }, (error: any) => {
            console.error('Error reloading data for office:', error);
          });
      }
    });

    // Account type change - reload accounts (same logic as normal component)
    this.addClientTransferForm.controls.toAccountType.valueChanges.subscribe((accountTypeId: any) => {
      console.log('Account type changed:', accountTypeId);

      const currentOfficeId = this.addClientTransferForm.controls.toOfficeId.value;
      if (accountTypeId && currentOfficeId && this.id && this.accountTypeId) {
        console.log('Reloading accounts for account type...');

        // Inclure aussi le client sélectionné si disponible
        const currentClient = this.addClientTransferForm.controls.toClientId.value;
        const formValue: any = {
          toOfficeId: currentOfficeId,
          toAccountType: accountTypeId
        };

        // Ajouter le client si c'est un objet
        if (currentClient && typeof currentClient === 'object') {
          formValue.toClientId = currentClient;
        }

        const refinedFormValue = this.refineObject(formValue);

        this.accountTransfersService
          .newAccountTranferResource(this.id, this.accountTypeId, refinedFormValue)
          .subscribe((response: any) => {
            this.toAccountData = response.toAccountOptions;
            // Reset account selection when account type changes
            this.addClientTransferForm.patchValue({ toAccountId: '' });
            console.log('Accounts reloaded for account type:', accountTypeId, this.toAccountData);
          }, (error: any) => {
            console.error('Error reloading accounts for account type:', error);
          });
      } else {
        console.log('Cannot reload accounts - missing required data:', {
          accountTypeId,
          toOfficeId: currentOfficeId,
          id: this.id,
          componentAccountTypeId: this.accountTypeId
        });
      }
    });
  }

  /**
   * Displays Client name in form control input.
   * @param {any} client Client data.
   * @returns {string} Client name if valid otherwise undefined.
   */
  displayClient(client: any): string | undefined {
    if (!client) return undefined;
    if (typeof client === 'string') return client; // Si c'est déjà une string (recherche)
    return client.displayName;
  }

  /**
   * Submits the add client transfer form.
   */
  submit() {
    if (this.addClientTransferForm.valid) {
      const formData = this.addClientTransferForm.value;

      // Gérer le client - peut être un objet ou un ID
      let client: any;
      let clientId: any;
      if (typeof formData.toClientId === 'object' && formData.toClientId !== null) {
        // Si c'est un objet client complet
        client = formData.toClientId;
        clientId = client.id;
      } else {
        // Si c'est juste un ID, chercher le client
        clientId = formData.toClientId;
        client = this.clientsData.find((c: any) => c.id === clientId);
      }

      // Ajouter les noms pour l'affichage dans le tableau
      const accountType = this.toAccountTypeData.find((at: any) => at.id === formData.toAccountType);
      const account = this.toAccountData.find((a: any) => a.id === formData.toAccountId);

      const result = {
        toOfficeId: formData.toOfficeId,
        toClientId: clientId,
        toAccountType: formData.toAccountType,
        toAccountId: formData.toAccountId,
        transferAmount: formData.transferAmount,
        toClientName: client ? client.displayName : clientId,
        toAccountTypeName: accountType ? accountType.value : formData.toAccountType,
        toAccountName: account ? `${account.productName} - ${account.accountNo}` : formData.toAccountId
      };

      this.dialogRef.close(result);
    }
  }

  /**
   * Refine Object
   * Removes the object param with null or '' values
   * Same logic as the normal component
   */
  refineObject(dataObj: { [x: string]: any }) {
    if (dataObj.toClientId && typeof dataObj.toClientId === 'object') {
      dataObj.toClientId = dataObj.toClientId.id;
    }
    const propNames = Object.getOwnPropertyNames(dataObj);
    for (let i = 0; i < propNames.length; i++) {
      const propName = propNames[i];
      if (dataObj[propName] === null || dataObj[propName] === undefined || dataObj[propName] === '') {
        delete dataObj[propName];
      }
    }
    return dataObj;
  }

  /**
   * Cancels the dialog.
   */
  cancel() {
    this.dialogRef.close();
  }
}

/** Angular Imports */
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

/** Custom Services */
import { AccountTransfersService } from '../account-transfers.service';
import { SettingsService } from 'app/settings/settings.service';
import { ClientsService } from 'app/clients/clients.service';
import { Dates } from 'app/core/utils/dates';

/** Custom Dialogs */
import { AddClientTransferDialogComponent } from './add-client-transfer-dialog/add-client-transfer-dialog.component';
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';

/**
 * Make Multiple Account Transfers component.
 */
@Component({
  selector: 'mifosx-make-multiple-account-transfers',
  templateUrl: './make-multiple-account-transfers.component.html',
  styleUrls: ['./make-multiple-account-transfers.component.scss']
})
export class MakeMultipleAccountTransfersComponent implements OnInit, AfterViewInit {
  /** Make Multiple Account Transfers form. */
  makeMultipleAccountTransfersForm: UntypedFormGroup;
  /** Account Transfers Template data. */
  accountTransfersTemplateData: any;
  /** To Office Type Data */
  toOfficeTypeData: any;
  /** To Client Type Data */
  toClientTypeData: any;
  /** To Account Type Data */
  toAccountTypeData: any;
  /** To Account Data */
  toAccountData: any;
  /** Account Type Id */
  accountTypeId: any;
  /** Account Type */
  accountType: any;
  /** Savings Id or Loans Id */
  id: any;
  /** Clients Data */
  clientsData: any;
  /** Multiple Transfer Clients */
  transferClients: any[] = [];

  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();

  /**
   * Retrieves the account transfers template data from `resolve`.
   * @param {UntypedFormBuilder} formBuilder Form Builder.
   * @param {AccountTransfersService} accountTransfersService Account Transfers Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {Dates} dateUtils Date Utils.
   * @param {SettingsService} settingsService Settings Service.
   * @param {ClientsService} clientsService Clients Service.
   * @param {MatDialog} dialog Mat Dialog.
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private accountTransfersService: AccountTransfersService,
    private route: ActivatedRoute,
    private router: Router,
    private dateUtils: Dates,
    private settingsService: SettingsService,
    private clientsService: ClientsService,
    public dialog: MatDialog
  ) {
    this.route.data.subscribe((data: { accountTransfersTemplateData: any }) => {
      this.accountTransfersTemplateData = data.accountTransfersTemplateData;
      this.setParams();
      this.setOptions();
    });
  }

  /** Sets the value from the URL */
  setParams() {
    this.accountType = this.route.snapshot.queryParams['accountType'];
    switch (this.accountType) {
      case 'fromloans':
        this.accountTypeId = '1';
        this.id = this.route.snapshot.queryParams['loanId'];
        break;
      case 'fromsavings':
        this.accountTypeId = '2';
        this.id = this.route.snapshot.queryParams['savingsId'];
        break;
      default:
        this.accountTypeId = '0';
    }
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    
    // Debug: Vérifier l'initialisation de la date
    console.log('Business date:', this.settingsService.businessDate);
    console.log('Max date:', this.maxDate);
    console.log('Business date type:', typeof this.settingsService.businessDate);
    console.log('Business date value:', this.settingsService.businessDate);
    
    this.setMakeMultipleAccountTransfersForm();
    
    // Debug après initialisation du formulaire
    console.log('Form date value after init:', this.makeMultipleAccountTransfersForm.value.transferDate);
    console.log('Form date control valid:', this.makeMultipleAccountTransfersForm.controls.transferDate.valid);
    console.log('Form date control errors:', this.makeMultipleAccountTransfersForm.controls.transferDate.errors);
    
    // Vérifier et corriger la date si nécessaire
    this.ensureTransferDateIsSet();
  }

  /**
   * Sets the make multiple account transfers form.
   */
  setMakeMultipleAccountTransfersForm() {
    // S'assurer qu'on a une date valide
    const defaultDate = this.settingsService.businessDate || new Date();
    console.log('Default date for form:', defaultDate);
    console.log('Default date type:', typeof defaultDate);
    
    this.makeMultipleAccountTransfersForm = this.formBuilder.group({
      toOfficeId: ['', Validators.required],
      transferDate: [defaultDate, Validators.required],
      transferDescription: ['', Validators.required]
    });
    
    console.log('Form created with values:', this.makeMultipleAccountTransfersForm.value);
  }

  /**
   * Ensures that the transfer date is properly set
   */
  ensureTransferDateIsSet() {
    const currentDate = this.makeMultipleAccountTransfersForm.value.transferDate;
    console.log('Checking transfer date:', currentDate);
    
    if (!currentDate) {
      console.log('Transfer date is missing, setting default date');
      const defaultDate = this.settingsService.businessDate || new Date();
      this.makeMultipleAccountTransfersForm.patchValue({
        transferDate: defaultDate
      });
      console.log('Transfer date set to:', defaultDate);
    }
  }

  /** Sets options value */
  setOptions() {
    this.toOfficeTypeData = this.accountTransfersTemplateData.toOfficeOptions;
    this.toAccountTypeData = this.accountTransfersTemplateData.toAccountTypeOptions;
    this.toAccountData = this.accountTransfersTemplateData.toAccountOptions;
  }

  /** Executes on change of various select options */
  changeEvent() {
    const formValue = this.refineObject(this.makeMultipleAccountTransfersForm.value);
    this.accountTransfersService
      .newAccountTranferResource(this.id, this.accountTypeId, formValue)
      .subscribe((response: any) => {
        this.accountTransfersTemplateData = response;
        this.toClientTypeData = response.toClientOptions;
        this.setOptions();
      });
  }

  /** Refine Object
   * Removes the object param with null or '' values
   */
  refineObject(dataObj: { [x: string]: any; transferDate: any }) {
    delete dataObj.transferDate;
    if (dataObj.toClientId) {
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
   * Subscribes to Clients search filter:
   */
  ngAfterViewInit() {
    // Initialize any view-specific logic here
    console.log('Multiple transfers component view initialized');
  }

  /**
   * Opens dialog to add a new client transfer
   */
  addClientTransfer() {
    // Vérifier que le bureau est sélectionné avant d'ouvrir le modal
    if (!this.makeMultipleAccountTransfersForm.value.toOfficeId) {
      alert('Veuillez d\'abord sélectionner un bureau de destination');
      return;
    }

    // S'assurer que les données sont à jour
    const formValue = this.refineObject(this.makeMultipleAccountTransfersForm.value);
    this.accountTransfersService
      .newAccountTranferResource(this.id, this.accountTypeId, formValue)
      .subscribe((response: any) => {
        this.accountTransfersTemplateData = response;
        this.toClientTypeData = response.toClientOptions;
        this.setOptions();

        // Debug: Vérifier les données avant d'ouvrir le modal
        console.log('Data before opening modal:');
        console.log('toOfficeTypeData:', this.toOfficeTypeData);
        console.log('toAccountTypeData:', this.toAccountTypeData);
        console.log('toAccountData:', this.toAccountData);
        console.log('clientsData:', this.clientsData);

        // Maintenant ouvrir le modal avec les données mises à jour
        const dialogRef = this.dialog.open(AddClientTransferDialogComponent, {
          data: {
            toOfficeTypeData: this.toOfficeTypeData,
            toAccountTypeData: this.toAccountTypeData,
            toAccountData: this.toAccountData,
            clientsData: this.clientsData,
            toOfficeId: this.makeMultipleAccountTransfersForm.value.toOfficeId,
            accountTypeId: this.accountTypeId,
            id: this.id,
            // Passer aussi les données initiales du resolver
            initialAccountTransfersTemplateData: this.accountTransfersTemplateData
          }
        });

        dialogRef.afterClosed().subscribe((result: any) => {
          if (result) {
            this.transferClients.push({
              id: Date.now(), // Temporary ID
              ...result
            });
          }
        });
      });
  }

  /**
   * Opens dialog to edit an existing client transfer
   */
  editClientTransfer(client: any) {
    const dialogRef = this.dialog.open(AddClientTransferDialogComponent, {
      data: {
        client: client,
        toOfficeTypeData: this.toOfficeTypeData,
        toAccountTypeData: this.toAccountTypeData,
        toAccountData: this.toAccountData,
        clientsData: this.clientsData,
        toOfficeId: this.makeMultipleAccountTransfersForm.value.toOfficeId,
        accountTypeId: this.accountTypeId,
        id: this.id,
        // Passer aussi les données initiales du resolver
        initialAccountTransfersTemplateData: this.accountTransfersTemplateData
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        const index = this.transferClients.findIndex(c => c.id === client.id);
        if (index !== -1) {
          this.transferClients[index] = { ...client, ...result };
        }
      }
    });
  }

  /**
   * Calculates the total amount of all transfers
   */
  getTotalAmount(): number {
    return this.transferClients.reduce((total, client) => {
      return total + (parseFloat(client.transferAmount) || 0);
    }, 0);
  }

  /**
   * Gets the office name by ID
   */
  getOfficeName(officeId: any): string {
    const office = this.toOfficeTypeData?.find((o: any) => o.id === officeId);
    return office ? office.name : officeId;
  }

  /**
   * Removes a client transfer from the list
   */
  removeClientTransfer(client: any) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        heading: 'labels.buttons.Confirm Delete',
        dialogContext: `Êtes-vous sûr de vouloir supprimer le transfert pour le client "${client.toClientName || client.toClientId}"`,
        type: 'delete'
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result && result.confirm) {
        const index = this.transferClients.findIndex(c => c.id === client.id);
        if (index !== -1) {
          this.transferClients.splice(index, 1);
        }
      }
    });
  }

  /** Flag to show preview mode */
  showPreview = false;

  /**
   * Shows the preview of all transfers before submission.
   */
  submit() {
    if (this.transferClients.length === 0) {
      alert('Veuillez ajouter au moins un client pour le transfert');
      return;
    }

    this.showPreview = true;
  }

  /**
   * Cancels the preview and returns to edit mode.
   */
  cancelPreview() {
    this.showPreview = false;
  }

  /**
   * Confirms and submits the transfers.
   */
  confirmSubmit() {
    // Forcer la validation du formulaire
    this.makeMultipleAccountTransfersForm.markAllAsTouched();
    
    // Vérifier que le formulaire est valide
    if (!this.makeMultipleAccountTransfersForm.valid) {
      console.error('Formulaire invalide:', this.makeMultipleAccountTransfersForm.errors);
      console.error('Erreurs par contrôle:', Object.keys(this.makeMultipleAccountTransfersForm.controls).map(key => ({
        control: key,
        errors: this.makeMultipleAccountTransfersForm.controls[key].errors,
        value: this.makeMultipleAccountTransfersForm.controls[key].value
      })));
      alert('Veuillez corriger les erreurs dans le formulaire avant de continuer.');
      return;
    }

    const dateFormat = this.settingsService.dateFormat;
    const locale = this.settingsService.language.code;

    // Debug: Vérifier la date avant formatage
    const rawTransferDate = this.makeMultipleAccountTransfersForm.value.transferDate;
    console.log('=== DEBUG DATE TRANSFER ===');
    console.log('Raw transfer date:', rawTransferDate);
    console.log('Raw transfer date type:', typeof rawTransferDate);
    console.log('Raw transfer date is null:', rawTransferDate === null);
    console.log('Raw transfer date is undefined:', rawTransferDate === undefined);
    console.log('Raw transfer date is empty string:', rawTransferDate === '');
    console.log('Date format:', dateFormat);
    console.log('Form valid:', this.makeMultipleAccountTransfersForm.valid);
    console.log('Form value:', this.makeMultipleAccountTransfersForm.value);
    console.log('Form date control valid:', this.makeMultipleAccountTransfersForm.controls.transferDate.valid);
    console.log('Form date control errors:', this.makeMultipleAccountTransfersForm.controls.transferDate.errors);
    console.log('Form date control touched:', this.makeMultipleAccountTransfersForm.controls.transferDate.touched);
    console.log('Form date control dirty:', this.makeMultipleAccountTransfersForm.controls.transferDate.dirty);
    console.log('==========================');

    // Vérifier que la date est valide
    if (!rawTransferDate) {
      console.error('ERREUR: La date de transfert est manquante ou invalide');
      console.log('Tentative de correction automatique...');
      
      // Essayer de corriger automatiquement
      this.ensureTransferDateIsSet();
      
      // Vérifier à nouveau
      const correctedDate = this.makeMultipleAccountTransfersForm.value.transferDate;
      if (!correctedDate) {
        alert('La date de transfert est requise. Veuillez sélectionner une date valide.');
        return;
      } else {
        console.log('Date corrigée automatiquement:', correctedDate);
        // Continuer avec la date corrigée
        const formattedTransferDate = this.dateUtils.formatDate(correctedDate, dateFormat);
        console.log('Formatted corrected date:', formattedTransferDate);
        
        if (!formattedTransferDate) {
          alert('Erreur lors du formatage de la date de transfert corrigée.');
          return;
        }
        
        // Utiliser la date corrigée
        const multipleTransfersData = {
          transferDate: formattedTransferDate,
          transferDescription: this.makeMultipleAccountTransfersForm.value.transferDescription,
          dateFormat,
          locale,
          fromAccountId: this.id,
          fromAccountType: this.accountTypeId,
          fromClientId: this.accountTransfersTemplateData.fromClient.id,
          fromOfficeId: this.accountTransfersTemplateData.fromClient.officeId,
          
          toAccounts: this.transferClients.map(client => ({
            toClientId: client.toClientId,
            toAccountType: client.toAccountType,
            toAccountId: client.toAccountId,
            transferAmount: client.transferAmount,
            toOfficeId: client.toOfficeId, // Utiliser le toOfficeId de chaque client
          }))
        };

        // Appel API pour le transfert multiple
        console.log('Multiple transfers data with corrected date:', multipleTransfersData);

        this.accountTransfersService.createMultiTransfer(multipleTransfersData).subscribe(
          (response: any) => {
            console.log('Transferts multiples enregistrés avec succès:', response);
            alert('Tous les transferts ont été enregistrés avec succès.');
            this.transferClients = [];
            this.showPreview = false;
          },
          (error: any) => {
            console.error('Erreur lors de l\'enregistrement des transferts multiples:', error);
            alert('Une erreur est survenue lors de l\'enregistrement des transferts multiples.');
          }
        );

        // Hide preview after submission
        this.showPreview = false;
        return;
      }
    }

    // Vérifier que c'est bien une date valide
    if (!(rawTransferDate instanceof Date) || isNaN(rawTransferDate.getTime())) {
      console.error('ERREUR: La date de transfert n\'est pas une date valide');
      alert('La date de transfert sélectionnée n\'est pas valide. Veuillez sélectionner une date valide.');
      return;
    }

    const formattedTransferDate = this.dateUtils.formatDate(rawTransferDate, dateFormat);
    console.log('Formatted transfer date:', formattedTransferDate);

    // Vérifier que la date formatée est valide
    if (!formattedTransferDate) {
      alert('Erreur lors du formatage de la date de transfert');
      return;
    }

    const multipleTransfersData = {
      transferDate: formattedTransferDate,
      transferDescription: this.makeMultipleAccountTransfersForm.value.transferDescription,
      dateFormat,
      locale,
      fromAccountId: this.id,
      fromAccountType: this.accountTypeId,
      fromClientId: this.accountTransfersTemplateData.fromClient.id,
      fromOfficeId: this.accountTransfersTemplateData.fromClient.officeId,

      toAccounts: this.transferClients.map(client => ({
        toClientId: client.toClientId,
        toAccountType: client.toAccountType,
        toAccountId: client.toAccountId,
        transferAmount: client.transferAmount,
        toOfficeId: client.toOfficeId, // Utiliser le toOfficeId de chaque client
      }))
    };

    // Appel API pour le transfert multiple
    console.log('Multiple transfers data:', multipleTransfersData);

    this.accountTransfersService.createMultiTransfer(multipleTransfersData).subscribe(
      (response: any) => {
        console.log('Transferts multiples enregistrés avec succès:', response);
        alert('Tous les transferts ont été enregistrés avec succès.');
        this.transferClients = [];
        this.showPreview = false;
        // Optionnel: rediriger vers la liste des transactions
        // this.router.navigate(['../../transactions'], { relativeTo: this.route });
      },
      (error: any) => {
        console.error('Erreur lors de l\'enregistrement des transferts multiples:', error);
        alert('Une erreur est survenue lors de l\'enregistrement des transferts multiples.');
      }
    );

    // Hide preview after submission
    this.showPreview = false;
  }
}

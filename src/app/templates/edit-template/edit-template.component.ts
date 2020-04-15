import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as ClassicEditorBuild from '@ckeditor/ckeditor5-build-classic';
import { TemplatesService } from '../templates.service';

@Component({
  selector: 'mifosx-edit-template',
  templateUrl: './edit-template.component.html',
  styleUrls: ['./edit-template.component.scss']
})
export class EditTemplateComponent implements OnInit {

  @ViewChild('textEditor') textEditor: any;


  /** Template Data */
  templateData: any;
  /** Template Form. */
  templateForm: FormGroup;
  /** Display Map Keys. */
  isDisplayedMapKeys = false;
  /** Map Key count. */
  mapKeyCount = 0;
  /** Entity. */
  entity: any;
  /** Type. */
  type: any;
  /** Loaded Map Keys. */
  loadedMapKeys = 0;
  /** CKEditor. */
  public Editor = ClassicEditorBuild;

   /**
    * Retrieves the template data from `resolve`.
    * @param {TemplateService} templateService Accounting Service.
    * @param {ActivatedRoute} route Activated Route.
    * @param {Router} router Router for navigation.
    * @param {MatDialog} dialog Dialog reference.
    */

  constructor(private route: ActivatedRoute,
              private templateService: TemplatesService,
              private router: Router,
              private formBuilder: FormBuilder) {
    this.route.data.subscribe((data: {selectedTemplate: any}) => {
      this.templateData = data.selectedTemplate;
      this.loadedMapKeys = this.templateData.template.mappers.length;
      this.getInitialEntity(this.templateData.template.entity);
      this.getInitialType(this.templateData.template.type);
    });
   }

  ngOnInit() {
    this.templateFormInitialized();
    this.hideMapKeys();
  }

  /**
   * Initialize Template Form.
   */
  templateFormInitialized() {
    this.templateForm = this.formBuilder.group({
      'templateName': [this.templateData.template.name, Validators.required],
    });
  }

  /**
   * Display Map Keys on button press.
   */
  displayMapKeys() {
    this.isDisplayedMapKeys = true;
    (<HTMLElement>document.getElementById('mappersLoaded')).removeAttribute('style');
    (<HTMLElement>document.getElementById('mappersAdded')).removeAttribute('style');
  }

  /**
   * Hide Map Keys on button press.
   */
  hideMapKeys() {
    this.isDisplayedMapKeys = false;
    (<HTMLElement> document.getElementById('mappersLoaded')).setAttribute('style', 'display:none');
    (<HTMLElement> document.getElementById('mappersAdded')).setAttribute('style', 'display:none');
  }

  /**
   * Add new map keys.
   */
  addNewKey() {
    this.mapKeyCount += 1;
  }

  /**
   * Remove a map key.
   */
  removeKey() {
    this.mapKeyCount -= 1;
  }

  /**
   * Edit Template Form.
   */
  editTemplate() {
    const entity = this.entity;
    const type = this.type;
    const name = this.templateForm.get('templateName').value;
    const mapperArray: any = [];
    const text = this.textEditor.editorInstance.getData();

    for (let i = 0; i < this.loadedMapKeys; i++) {
      const keyId = 'keyLoaded' + i;
      const valId = 'valLoaded' + i;
      const mapkey = (<HTMLInputElement>document.getElementById(keyId)).value;
      const mapval = (<HTMLInputElement>document.getElementById(valId)).value;
      const obj = {mapperskey: mapkey, mappersorder: i, mappersvalue: mapval};
      mapperArray.push(obj);
    }

    for (let i = 0; i < this.mapKeyCount; i++) {
      const keyId = 'key' + i;
      const valId = 'val' + i;
      const mapkey = (<HTMLInputElement>document.getElementById(keyId)).value;
      const mapval = (<HTMLInputElement>document.getElementById(valId)).value;
      const obj = {mapperskey: mapkey, mappersorder: i, mappersvalue: mapval};
      mapperArray.push(obj);
    }

    const templateData = {entity: entity, mappers: mapperArray, name: name, text: text, type: type};
    this.templateService.editTemplate(templateData, this.templateData.template.id).subscribe(() => {
      this.router.navigate(['../templates/', this.templateData.template.id]);
    });
  }

  onChangeEntity(entity: any) {
    this.entity = entity;
  }

  onChangeType(type: any) {
    this.type = type;
  }

  removeLoaded(key: any) {
    this.templateData.template.mappers = this.templateData.template.mappers.filter((x: any) => x.mapperkey !== key);
    this.loadedMapKeys -= 1;
  }

  getInitialEntity(entity: any) {
    this.entity = this.templateData.entities.filter((x: any) => x.name === entity)[0].id;
  }

  getInitialType(type: any) {
    this.type = this.templateData.types.filter((x: any) => x.name === type)[0].id;
  }

}

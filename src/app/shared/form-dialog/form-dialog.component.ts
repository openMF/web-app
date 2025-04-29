import { Component, OnInit, Inject, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormGroup } from '@angular/forms';

import { FormfieldBase } from './formfield/model/formfield-base';
import { FormGroupService } from './form-group.service';

const layoutGap = 2;
declare var google: any;

@Component({
  selector: 'mifosx-form-dialog',
  templateUrl: './form-dialog.component.html',
  styleUrls: ['./form-dialog.component.scss']
})
export class FormDialogComponent implements OnInit, AfterViewInit {
  layout: {
    columns: number;
    columnWidth?: number;
    flex?: number;
    gap?: number;
    cancelButtonText?: string;
    addButtonText?: string;
  } = {
    columns: 1,
    columnWidth: 400,
    flex: 100,
    cancelButtonText: 'Cancel',
    addButtonText: 'Add'
  };

  form: UntypedFormGroup;
  formfields: FormfieldBase[] = [];
  pristine: boolean;

  constructor(
    public dialogRef: MatDialogRef<FormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formGroupService: FormGroupService
  ) {
    this.dialogRef.disableClose = data.disableClose !== undefined ? data.disableClose : true;
    this.formfields = data.formfields.sort(
      (a: FormfieldBase, b: FormfieldBase) => a.order - b.order
    );
    this.pristine = data.pristine !== undefined ? data.pristine : true;
    this.layout = { ...this.layout, ...data.layout };
    this.layout.gap = this.layout.columns > 1 ? layoutGap : 0;
    this.layout.flex = this.layout.flex / this.layout.columns - this.layout.gap;
  }

  ngOnInit(): void {
    this.dialogRef.updateSize(`${this.layout.columnWidth * this.layout.columns}px`);
    this.form = this.formGroupService.createFormGroup(this.formfields);
    if (!this.pristine) {
      this.form.markAsDirty();
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initMap(), 0);
  }

  initMap(): void {
    const latVal = this.form.get('latitude')?.value;
    const lngVal = this.form.get('longitude')?.value;

    const defaultLat = latVal && !isNaN(parseFloat(latVal)) ? parseFloat(latVal) : 4.7110;
    const defaultLng = lngVal && !isNaN(parseFloat(lngVal)) ? parseFloat(lngVal) : -74.0721;

    const map = new google.maps.Map(document.getElementById('map') as HTMLElement, {
      center: { lat: defaultLat, lng: defaultLng },
      zoom: 14
    });

    const marker = new google.maps.Marker({
      position: { lat: defaultLat, lng: defaultLng },
      map: map,
      draggable: true
    });

    google.maps.event.addListener(map, 'click', (event: any) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      marker.setPosition({ lat, lng });

      this.form.patchValue({
        latitude: lat,
        longitude: lng
      });
    });
    
  }
}

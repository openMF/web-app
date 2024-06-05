import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductsService } from 'app/products/products.service';

@Component({
  selector: 'mifosx-loan-product-apps',
  templateUrl: './loan-product-apps.component.html',
  styleUrls: ['./loan-product-apps.component.scss']
})
export class LoanProductAppsComponent implements OnInit {
  @Input() loanProductsTemplate: any;
  @Input() loanProduct: any;


  loanProductAppsForm: UntypedFormGroup;
  channelData: any = [];
  dataNew: any = [];

  get channelFormArray() {
    return this.loanProductAppsForm.controls.channels as UntypedFormArray;
  }

  constructor(private productService: ProductsService, private formBuilder: UntypedFormBuilder, private router: Router) {

    this.createloanProductAppsForm();
    this.getChannels();
  }

  ngOnInit(): void {

    if ( this.router.url.includes('edit') ) {
      this.loadForm(this.loanProductsTemplate);
    }

  }

  get line(): UntypedFormGroup {
    return this.formBuilder.group({
        channels: this.formBuilder.array([
         ]),
    });
}

  loadForm(data: any) {
    data?.channels.forEach(element => {
      const linesFormArray = this.loanProductAppsForm.get('channels') as UntypedFormArray;
      linesFormArray.push(this.line);
    });

    this.loanProductAppsForm.patchValue(data);
  }

  createloanProductAppsForm() {
    this.loanProductAppsForm = this.formBuilder.group({
      channels: new UntypedFormArray([])
    });
  }

  private addCheckboxes() {
    this.channelData.forEach(() => this.channelFormArray.push(new UntypedFormControl(false)));
  }

  getChannels() {
    this.productService.getChannels().subscribe((data) => {
      this.channelData = data;
      this.addCheckboxes();
    });
  }

  get loanProductApps() {
    const selectedChannelIds = this.loanProductAppsForm.value.channels
      .map((checked, i) => checked ? this.channelData[i]?.code : null)
      .filter(v => v !== null);
    return {channels: selectedChannelIds};

  }

}

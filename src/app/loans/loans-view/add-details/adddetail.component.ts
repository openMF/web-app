import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mifosx-add-details',
  templateUrl: './adddetail.component.html',
  styleUrls: ['./adddetail.component.scss']
})
export class AdddetailTabComponent implements OnInit {
  loanDetails: any;
  dataObject: {
    property: string,
    value: string
  }[];

  constructor(private route: ActivatedRoute) {
    this.route.parent.data.subscribe((data: { loanDetailsData: any }) => {
      this.loanDetails = data.loanDetailsData;
    });
  }


  ngOnInit() {
  }

}

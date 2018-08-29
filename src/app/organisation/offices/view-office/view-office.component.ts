import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'mifosx-view-office',
  templateUrl: './view-office.component.html',
  styleUrls: ['./view-office.component.scss']
})
export class ViewOfficeComponent implements OnInit {
  office: any;
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { office: any }) => {
      this.office = data.office;
    });
  }

  ngOnInit() {
  }

}

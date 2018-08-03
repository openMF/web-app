import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mifosx-view-gl-account',
  templateUrl: './view-gl-account.component.html',
  styleUrls: ['./view-gl-account.component.scss']
})
export class ViewGlAccountComponent implements OnInit {

  glAccount: any;

  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { glAccount: any }) => {
      this.glAccount = data.glAccount;
    });
  }

  ngOnInit() {
  }

}

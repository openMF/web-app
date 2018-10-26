import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mifosx-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss']
})
export class RoleComponent implements OnInit {

  /** Roles data. */
  rolesData: any;
  /**
   * Retrieves the codes data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { roles: any }) => {
      this.rolesData = data.roles;
      console.log(this.rolesData)
    });
  }

  displayedColumns: string[] = [ 'name', 'description', 'status'];
  

  ngOnInit() {
  }

}

import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SystemService } from 'app/system/system.service';


@Component({
  selector: 'mifosx-createrole',
  templateUrl: './createrole.component.html',
  styleUrls: ['./createrole.component.scss']
})
export class CreateroleComponent implements OnInit {
/** Center form. */
roleForm: FormGroup;
  constructor(private formBuilder: FormBuilder,
    private systemService: SystemService,
    private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit() {
    this.createCenterForm();
  }

   /**
   * Creates the roles  form.
   */
  createCenterForm() {
    this.roleForm = this.formBuilder.group({
      'name': ['', Validators.required],
      'description': ['', Validators.required],
      
    });
  }

  /**
   * Submits the role form and creates role ,
   * if successful redirects to view roles.
   */
  submit() {

    const centerEntry = this.roleForm.value;
    this.systemService.createRole(centerEntry)
    .subscribe((response: any) => {
      this.router.navigate(['/system/roles'], { relativeTo: this.route });
  });

  }
}

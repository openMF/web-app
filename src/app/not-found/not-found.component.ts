import { Component, OnInit } from '@angular/core';
declare var particlesJS: any;

@Component({
  selector: 'mifosx-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    particlesJS.load('particles-js', '/assets/particles.json');
  }

}

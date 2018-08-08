/** Angular Imports */
import { NgModule } from '@angular/core';

/** Angular Font Awesome Imports */
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faFileUpload,
  faSearch
} from '@fortawesome/free-solid-svg-icons';

/** Add icons to the library for convenient access in other components. */
library.add(
  faFileUpload,
  faSearch
);

/**
 * Icons Module
 * Angular Font Awesome module is exported here.
 */
@NgModule({
  exports: [FontAwesomeModule]
})
export class IconsModule { }


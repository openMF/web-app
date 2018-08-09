/** Angular Imports */
import { NgModule } from '@angular/core';

/** Angular Font Awesome Imports */
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faCheckCircle,
  faEye,
  faEyeSlash,
  faFileUpload,
  faLock,
  faSearch,
  faUserCircle,
  faUserShield
} from '@fortawesome/free-solid-svg-icons';

/** Add icons to the library for convenient access in other components. */
library.add(
  faCheckCircle,
  faEye,
  faEyeSlash,
  faFileUpload,
  faLock,
  faSearch,
  faUserCircle,
  faUserShield
);

/**
 * Icons Module
 *
 * Angular Font Awesome module is exported here.
 */
@NgModule({
  exports: [FontAwesomeModule]
})
export class IconsModule { }


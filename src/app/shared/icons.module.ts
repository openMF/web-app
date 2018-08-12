/** Angular Imports */
import { NgModule } from '@angular/core';

/** Angular Font Awesome Imports */
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faBars,
  faBell,
  faChartBar,
  faCheckCircle,
  faChevronLeft,
  faChevronRight,
  faCircle,
  faCog,
  faEdit,
  faEye,
  faEyeSlash,
  faFileUpload,
  faFillDrip,
  faHome,
  faLocationArrow,
  faLock,
  faLockOpen,
  faMoneyBillAlt,
  faPlus,
  faSearch,
  faShieldAlt,
  faSignOutAlt,
  faSitemap,
  faSync,
  faTachometerAlt,
  faUniversity,
  faUserCircle,
  faUsers,
  faUserShield
} from '@fortawesome/free-solid-svg-icons';

/** Add icons to the library for convenient access in other components. */
library.add(
  faBars,
  faBell,
  faChartBar,
  faCheckCircle,
  faChevronLeft,
  faChevronRight,
  faCircle,
  faCog,
  faEdit,
  faEye,
  faEyeSlash,
  faFileUpload,
  faFillDrip,
  faHome,
  faLocationArrow,
  faLock,
  faLockOpen,
  faMoneyBillAlt,
  faPlus,
  faSearch,
  faShieldAlt,
  faSignOutAlt,
  faSitemap,
  faSync,
  faTachometerAlt,
  faUniversity,
  faUserCircle,
  faUsers,
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


/** Angular Imports */
import { BasePortalOutlet, CdkPortalOutlet, ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import { Component, ComponentRef, EmbeddedViewRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { PortalModule } from '@angular/cdk/portal';

/** rxjs Imports */
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

/* Popover Ref */
import { PopoverRef } from './popover-ref';
import { PopoverArrowDirective } from './popover-arrow.directive';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Internal component that wraps user-provided popover content.
 */
@Component({
  selector: 'mifosx-popover',
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    CdkPortalOutlet,
    PopoverArrowDirective
  ]
})
export class PopoverComponent extends BasePortalOutlet {
  @ViewChild(CdkPortalOutlet, { static: true }) portalOutlet: CdkPortalOutlet;

  attachComponentPortal<T>(componentPortal: ComponentPortal<any>): ComponentRef<T> {
    return this.portalOutlet.attachComponentPortal(componentPortal);
  }

  attachTemplatePortal<C>(portal: TemplatePortal<C>): EmbeddedViewRef<C> {
    return this.portalOutlet.attachTemplatePortal(portal);
  }
}

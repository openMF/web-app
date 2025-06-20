/** Angular Imports */
import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';

/** RxJS Imports */
import { forkJoin } from 'rxjs';

/** Custom Services */
import { NotificationsService } from 'app/notifications/notifications.service';
import { environment } from '../../../environments/environment';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatBadge } from '@angular/material/badge';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatIcon } from '@angular/material/icon';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Notifications Tray Component
 */
@Component({
  selector: 'mifosx-notifications-tray',
  templateUrl: './notifications-tray.component.html',
  styleUrls: ['./notifications-tray.component.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatIconButton,
    MatTooltip,
    MatMenuTrigger,
    MatBadge,
    FaIconComponent,
    MatMenu,
    MatIcon,
    MatMenuItem
  ]
})
export class NotificationsTrayComponent implements OnInit, OnDestroy {
  /** Wait time between API status calls 60 seg */
  waitTime = environment.waitTimeForNotifications || 60;
  /** Read Notifications */
  readNotifications: any[] = [];
  /** Displayed Read Notifications */
  displayedReadNotifications: any[] = [];
  /** Unread Notifications */
  unreadNotifications: any[] = [];
  /** Timer to refetch notifications every 60 seconds */
  timer: any;

  /**
   * Gets router link prefix from notification's objectType attribute
   * Shares, Savings, Deposits, Loans routes inaccessible because of dependency on entity ID.
   */
  routeMap: any = {
    client: '/clients/',
    group: '/groups/',
    loan: '/loans-accounts/',
    center: '/centers/',
    shareAccount: '/shares-accounts/',
    fixedDeposit: '/fixed-deposits-accounts/',
    recurringDepositAccount: '/recurring-deposits-accounts/',
    savingsAccount: '/savings-accounts/',
    shareProduct: '/products/share-products/',
    loanProduct: '/products/loan-products/'
  };

  /**
   * @param {NotificationsService} notificationsService Notifications Service
   */
  constructor(public notificationsService: NotificationsService) {
    forkJoin([
      this.notificationsService.getNotifications(true, 9),
      this.notificationsService.getNotifications(false, 9)]).subscribe((response: any[]) => {
      this.readNotifications = response[0].pageItems;
      this.unreadNotifications = response[1].pageItems;
      this.setNotifications();
    });
  }

  ngOnInit() {
    this.fetchUnreadNotifications();
  }

  ngOnDestroy() {
    this.destroy();
  }

  public destroy() {
    clearTimeout(this.timer);
  }

  /**
   * Restructures displayed read notifications vis-a-vis unread notifications.
   */
  setNotifications() {
    const length = this.unreadNotifications.length;
    this.displayedReadNotifications = length < 9 ? this.readNotifications.slice(0, 9 - length) : [];
  }

  /**
   * Recursively fetch unread notifications.
   */
  fetchUnreadNotifications() {
    this.notificationsService.getNotifications(false, 9).subscribe((response: any) => {
      this.unreadNotifications = this.unreadNotifications.concat(response.pageItems);
      this.setNotifications();
    });
    // this.mockNotifications(); // Uncomment for Testing.
    this.timer = setTimeout(() => {
      this.fetchUnreadNotifications();
    }, this.waitTime * 1000);
  }

  /**
   * Update read/unread notifications.
   */
  menuClosed() {
    // Update the server for read notifications.
    this.notificationsService.updateNotifications().subscribe(() => {});
    // Update locally for read notifications.
    this.readNotifications = this.unreadNotifications.concat(this.readNotifications);
    this.unreadNotifications = [];
    this.setNotifications();
  }

  /**
   * Function to test notifications in case of faulty backend.
   */
  mockNotifications() {
    this.notificationsService.getMockUnreadNotification().subscribe((response: any) => {
      this.unreadNotifications = this.unreadNotifications.concat(response.pageItems);
      this.setNotifications();
    });
  }
}

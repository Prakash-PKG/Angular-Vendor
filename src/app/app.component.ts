import { SessionTimeoutDialogComponent } from './session-timeout-dialog/session-timeout-dialog.component';
import { MessageDialogModel, TimeoutDialogModel } from './models/popup-models';
import { BusyDataModel } from './models/data-models';
import { MessageDialogComponent } from './message-dialog/message-dialog.component';
import { HomeService } from './home/home.service';
import { SidebarService } from './sidebar/sidebar.service';
import { AppService } from './app.service';
import { Component } from '@angular/core';
import { UserIdleService } from 'angular-user-idle';
import { MatDialog, MatDatepickerInputEvent, MatDialogRef } from '@angular/material';
import { globalConstant } from './common/global-constant';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'mVendor';
    timeRemaining: number = 0;
    timeoutDialogRef: MatDialogRef<SessionTimeoutDialogComponent>;

    constructor(private _userIdleService: UserIdleService,
        public dialog: MatDialog,
        private _homeService: HomeService,
        private _sidebarService: SidebarService,
        private _appService: AppService) {
    }

    onCancelClick() {
        this._appService.stopWatching();
        this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: null });
        this._appService.refreshSession()
            .subscribe(response => {
                this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
                if (response) {
                    this._appService.stopWatching();
                    this._appService.restartTimer();
                    this._appService.startWatching();
                    this.displayTimeoutUpdateStatus(response.body);
                }
                else {
                    this._appService.stopWatching();
                }
            },
                (error) => {
                    this._appService.stopWatching();
                    this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
                    console.log(error);
                    this.displayTimeoutUpdateStatus("Session not extended.");
                    this._homeService.updateSessionExpireDetails(true);
                    this._sidebarService.logout();
                });
    }

    displayTimeoutUpdateStatus(msg: string) {
        const dialogRef = this.dialog.open(MessageDialogComponent, {
            disableClose: true,
            panelClass: 'dialog-box',
            width: '550px',
            data: <MessageDialogModel>{
                title: "mTime Action",
                message: msg
            }
        });

        dialogRef.afterClosed().subscribe(result => {

        });
    }
    displayTimeoutStatus() {
        this.timeoutDialogRef = this.dialog.open(SessionTimeoutDialogComponent, {
            disableClose: true,
            panelClass: 'dialog-box',
            width: '550px',
            data: <TimeoutDialogModel>{
                title: "Session Timeout"
            }
        });

        this.timeoutDialogRef.afterClosed().subscribe(result => {
            if (result)
                this.onCancelClick();
        });
    }

    ngOnInit() {
        // Start watching when user idle is starting.

        this._userIdleService.onTimerStart().subscribe(count => {
            if (count == 1) {
                this.displayTimeoutStatus();
            }
            let timeRemaining = globalConstant.sessionTimeout.timeout - count;
            if (timeRemaining == globalConstant.sessionTimeout.timeout) {
                timeRemaining = 0;
            }
            this._appService.setSessionTimeCount(timeRemaining);
        });

        // Start watch when time is up.
        this._userIdleService.onTimeout().subscribe(() => {
            this.timeoutDialogRef.close();
            this._homeService.updateSessionExpireDetails(true);
            this._sidebarService.logout();
        });
    }
}

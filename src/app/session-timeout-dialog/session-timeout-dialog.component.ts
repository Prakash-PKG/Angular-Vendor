import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TimeoutDialogModel } from '../models/popup-models';
import { AppService } from '../app.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-session-timeout-dialog',
    templateUrl: './session-timeout-dialog.component.html',
    styleUrls: ['./session-timeout-dialog.component.scss']
})
export class SessionTimeoutDialogComponent implements OnInit {

    title: string;
    time: number;
    sessionTimeCountSub: Subscription;

    constructor(private _appService: AppService,
        public dialogRef: MatDialogRef<SessionTimeoutDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: TimeoutDialogModel) {

        this.title = data.title;
    }

    onCancel(): void {
        this.dialogRef.close(true);
    }

    ngOnInit() {
        this.sessionTimeCountSub = this._appService.sessionTimeCount$.subscribe((remaining) => {
            this.time = remaining;
        });
    }

    ngOnDestroy() {
        this.sessionTimeCountSub.unsubscribe();
    }

}

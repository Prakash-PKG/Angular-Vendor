import { AppService } from './../app.service';
import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

import { InvoiceCommunicationDisplayModel, CommunicationMsgModel } from './../models/data-models';

@Component({
    selector: 'app-invoice-communication-dialog',
    templateUrl: './invoice-communication-dialog.component.html',
    styleUrls: ['./invoice-communication-dialog.component.scss']
})
export class InvoiceCommunicationDialogComponent implements OnInit {

    msgs: CommunicationMsgModel[] = [];

    constructor(public dialogRef: MatDialogRef<InvoiceCommunicationDialogComponent>,
        private _appService: AppService,
        @Inject(MAT_DIALOG_DATA) public data: InvoiceCommunicationDisplayModel) {

        this.msgs = data.msgsList;
    }

    onClose(): void {
        this.dialogRef.close(true);
    }

    getFormattedDate(dtStr: string) {
        if(dtStr) {
            return this._appService.getFormattedDate(dtStr);
        }
        
        return "";
    }

    getFullName(msgModel: CommunicationMsgModel) {
        let fullName: string = msgModel.firstName + " ";
        if(msgModel.middleName) {
            fullName = fullName + msgModel.middleName + " ";
        }

        fullName = fullName + msgModel.lastName;

        let updatedDt: string = "";
        if(msgModel.updatedDate) {
            updatedDt = this._appService.getFormattedDate(msgModel.updatedDate);

            fullName = fullName + " - " +  updatedDt
        }

        return fullName;
    }

    ngOnInit() {
    }


}

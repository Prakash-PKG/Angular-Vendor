import { GrnSesDisplayModel } from './../models/data-models';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
@Component({
    selector: 'app-grn-ses-items',
    templateUrl: './grn-ses-items.component.html',
    styleUrls: ['./grn-ses-items.component.scss']
})
export class GrnSesItemsComponent implements OnInit {

    grnSesList: GrnSesDisplayModel[] = [];


    constructor(public dialogRef: MatDialogRef<GrnSesItemsComponent>,
                @Inject(MAT_DIALOG_DATA) public data: GrnSesDisplayModel[]) { }

    onCancelClick() {
        this.dialogRef.close();
    }

    onSelectClick(gs: GrnSesDisplayModel) {
        this.dialogRef.close(gs);
    }

    ngOnInit() {
        this.grnSesList = this.data;
    }

}

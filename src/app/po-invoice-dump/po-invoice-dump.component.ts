import { AppService } from './../app.service';
import { HomeService } from './../home/home.service';
import { globalConstant } from './../common/global-constant';
import { POInvoiceFinanceDumpReqModel, BusyDataModel, POInvoiceDumpInitResultModel } from './../models/data-models';
import { PoInvoiceDumpService } from './po-invoice-dump.service';
import { Component, OnInit } from '@angular/core';
import {MatDatepickerInputEvent} from '@angular/material/datepicker';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-po-invoice-dump',
    templateUrl: './po-invoice-dump.component.html',
    styleUrls: ['./po-invoice-dump.component.scss']
})
export class PoInvoiceDumpComponent implements OnInit {

    selectedDump: string = "incremental";
    maxStartDate: Date = new Date();
    minStartDate: Date = null;

    maxEndDate: Date = new Date();
    minEndDate: Date = null;

    startDate: Date = null;
    endDate: Date = null;

    startDateErrMsg: string = "";
    endDateErrMsg: string = "";

    _initDetails: POInvoiceDumpInitResultModel = null;

    incrementalStartDate: string = " - ";

    constructor(private __poInvoiceDumpService: PoInvoiceDumpService,
                private _appService: AppService,
                private _datePipe: DatePipe,
                private _homeService: HomeService) { }

    

    onDumpTypeChange(evtData) {
 
        if(evtData.value == "incremental") {
            
        }
        else {
           this.startDate = null;
           this.endDate = null;
        }

    }

    onIncrementalDownloadClick() {
        let req: POInvoiceFinanceDumpReqModel = {
            startDate: this._initDetails.lastDumpDt,
            endDate: null,
            employeeId: globalConstant.userDetails.userId,
            isIncremental: true
        };

        let displayStartDt: string = this._initDetails.lastDumpDt ? "-" + this._initDetails.lastDumpDt : "";
        let fileName: string = "po-invoice-dump" + displayStartDt + ".csv";
        this.downloadInvoiceFile(req, fileName);
    }

    onDateRangeDownloadClick() {

        if(!this.startDate) {
            this.startDateErrMsg = "Start Date is required";
        }

        if(!this.endDate) {
            this.endDateErrMsg = "End Date is required";
        }

        if(this.startDate && this.endDate) {
            let req: POInvoiceFinanceDumpReqModel = {
                startDate: this._datePipe.transform(this.startDate, this._appService.dbDateTimeFormat),
                endDate: this._datePipe.transform(this.endDate, this._appService.dbDateTimeFormat),
                employeeId: globalConstant.userDetails.userId,
                isIncremental: false
            };

            let displayStartDt: string = this._datePipe.transform(this.startDate, this._appService.displayDtFormat);
            let displayEndDt: string = this._datePipe.transform(this.endDate, this._appService.displayDtFormat);
            let fileName: string = "po-invoice-dump-" + displayStartDt + " to " + displayEndDt + ".csv";

            this.downloadInvoiceFile(req, fileName);
        }
    }

    onStartDateChange(evt: MatDatepickerInputEvent<Date>) {
        this.minEndDate = evt.value;
        this.startDateErrMsg = "";
    }

    onEndDateChange(evt: MatDatepickerInputEvent<Date>) {
        this.maxStartDate = evt.value;
        this.endDateErrMsg = "";
    }

    downloadInvoiceFile(req: POInvoiceFinanceDumpReqModel, fileName: string) {
        this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Loading..." });
        this.__poInvoiceDumpService.getFileData(req).subscribe(
            (data) => {
                this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
                const blob = new Blob([data.body], { type: 'application/octet-stream' });
                const url = window.URL.createObjectURL(blob);

                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
            },
            error => {
                console.log(error);
                this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
            });
    }

    async loadInitData() {
        this.incrementalStartDate = " - ";
        this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Loading..." });
        this._initDetails = await this.__poInvoiceDumpService.getPOInvoiceDumpInitDetails();
        if(this._initDetails && this._initDetails.lastDumpDt) {
            this.incrementalStartDate = this._datePipe.transform(new Date(this._initDetails.lastDumpDt), this._appService.displayDateTimeFormat);
        }
        this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
    }

    ngOnInit() {
        setTimeout(() => {
           this.loadInitData();
        }, 100);
    }
}

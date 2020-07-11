import { AppService } from './../app.service';
import { HomeService } from './../home/home.service';
import { globalConstant } from './../common/global-constant';
import { InvoiceFinanceDumpReqModel, BusyDataModel, InvoiceDumpInitResultModel } from './../models/data-models';
import { NonPoInvoiceDumpService } from './non-po-invoice-dump.service';
import { Component, OnInit } from '@angular/core';
import {MatDatepickerInputEvent} from '@angular/material/datepicker';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-non-po-invoice-dump',
    templateUrl: './non-po-invoice-dump.component.html',
    styleUrls: ['./non-po-invoice-dump.component.scss']
})
export class NonPoInvoiceDumpComponent implements OnInit {

    selectedDump: string = "incremental";
    maxStartDate: Date = new Date();
    minStartDate: Date = null;

    maxEndDate: Date = new Date();
    minEndDate: Date = null;

    startDate: Date = null;
    endDate: Date = null;

    startDateErrMsg: string = "";
    endDateErrMsg: string = "";

    _initDetails: InvoiceDumpInitResultModel = null;

    incrementalStartDate: string = " - ";

    constructor(private _nonpoInvoiceDumpService: NonPoInvoiceDumpService,
        private _appService: AppService,
        private _datePipe: DatePipe,
        private _homeService: HomeService) { }

    onDumpTypeChange(evtData) {

        if (evtData.value == "incremental") {

        }
        else {
            this.startDate = null;
            this.endDate = null;
        }

    }

    onIncrementalDownloadClick() {
        let req: InvoiceFinanceDumpReqModel = {
            startDate: this._initDetails.lastDumpDt,
            endDate: null,
            employeeId: globalConstant.userDetails.userId,
            isIncremental: true
        };

        let displayStartDt: string = this._initDetails.lastDumpDt ? "-" + this._initDetails.lastDumpDt : "";
        let fileName: string = "non-po-invoice-dump" + displayStartDt + ".csv";
        this.downloadInvoiceFile(req, fileName);
    }

    onDateRangeDownloadClick() {

        if (!this.startDate) {
            this.startDateErrMsg = "Start Date is required";
        }

        if (!this.endDate) {
            this.endDateErrMsg = "End Date is required";
        }

        if (this.startDate && this.endDate) {
            let req: InvoiceFinanceDumpReqModel = {
                startDate: this._datePipe.transform(this.startDate, this._appService.dbDateTimeFormat),
                endDate: this._datePipe.transform(this.endDate, this._appService.dbDateTimeFormat),
                employeeId: globalConstant.userDetails.userId,
                isIncremental: false
            };

            let displayStartDt: string = this._datePipe.transform(this.startDate, this._appService.displayDtFormat);
            let displayEndDt: string = this._datePipe.transform(this.endDate, this._appService.displayDtFormat);
            let fileName: string = "non-po-invoice-dump-" + displayStartDt + " to " + displayEndDt + ".csv";

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

    downloadInvoiceFile(req: InvoiceFinanceDumpReqModel, fileName: string) {
        this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Loading..." });
        this._nonpoInvoiceDumpService.getFileData(req).subscribe(
            (data) => {
                this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
                const blob = new Blob([data.body], { type: 'application/octet-stream' });
                const url = window.URL.createObjectURL(blob);

                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();

                this.loadInitData();
            },
            error => {
                console.log(error);
                this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
            });
    }

    async loadInitData() {
        this.incrementalStartDate = " - ";
        this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Loading..." });
        this._initDetails = await this._nonpoInvoiceDumpService.getNonPOInvoiceDumpInitDetails();
        if (this._initDetails && this._initDetails.lastDumpDt) {
            this.incrementalStartDate = this._datePipe.transform(new Date(this._initDetails.lastDumpDt), this._appService.displayDateTimeFormat);
        }
        this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
    }

    ngOnInit() {
        let dt: Date = new Date();
        dt.setDate(dt.getDate() + 1);
        this.maxEndDate = dt;

        setTimeout(() => {
            this.loadInitData();
        }, 100);
    }

}

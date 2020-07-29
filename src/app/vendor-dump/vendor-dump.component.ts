import { Component, OnInit } from '@angular/core';
import { BusyDataModel, InvoiceDumpInitResultModel, VendorDumpReqModel, VendorDumpInitResultModel } from '../models/data-models';
import { MatDatepickerInputEvent } from '@angular/material';
import { globalConstant } from '../common/global-constant';
import { AppService } from '../app.service';
import { DatePipe } from '@angular/common';
import { HomeService } from '../home/home.service';
import { VendorDumpService } from './vendor-dump.service';

@Component({
    selector: 'app-vendor-dump',
    templateUrl: './vendor-dump.component.html',
    styleUrls: ['./vendor-dump.component.scss']
})
export class VendorDumpComponent implements OnInit {
    selectedDump: string = "incremental";
    maxStartDate: Date = new Date();
    minStartDate: Date = null;

    maxEndDate: Date = new Date();
    minEndDate: Date = null;

    startDate: Date = null;
    endDate: Date = null;

    startDateErrMsg: string = "";
    endDateErrMsg: string = "";

    _initDetails: VendorDumpInitResultModel = null;

    incrementalStartDate: string = " - ";

    constructor(private __vendorDumpService: VendorDumpService,
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
        let req: VendorDumpReqModel = {
            startDate: this._initDetails.lastDumpDt,
            endDate: null,
            employeeId: globalConstant.userDetails.userId,
            isIncremental: true
        };

        let displayStartDt: string = this._initDetails.lastDumpDt ? "-" + this._initDetails.lastDumpDt : "";
        let fileName: string = "vendor-dump" + displayStartDt + ".csv";
        this.downloadVendorFile(req, fileName);
    }

    onDateRangeDownloadClick() {

        if (!this.startDate) {
            this.startDateErrMsg = "Start Date is required";
        }

        if (!this.endDate) {
            this.endDateErrMsg = "End Date is required";
        }

        if (this.startDate && this.endDate) {
            let updatedEndDt: Date = new Date(this.endDate);
            updatedEndDt.setDate(this.endDate.getDate() + 1);

            let req: VendorDumpReqModel = {
                startDate: this._datePipe.transform(this.startDate, this._appService.dbDateTimeFormat),
                endDate: this._datePipe.transform(updatedEndDt, this._appService.dbDateTimeFormat),
                employeeId: globalConstant.userDetails.userId,
                isIncremental: false
            };

            let displayStartDt: string = this._datePipe.transform(this.startDate, this._appService.displayDtFormat);
            let displayEndDt: string = this._datePipe.transform(this.endDate, this._appService.displayDtFormat);
            let fileName: string = "vendor-dump-" + displayStartDt + " to " + displayEndDt + ".csv";

            this.downloadVendorFile(req, fileName);
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

    downloadVendorFile(req: VendorDumpReqModel, fileName: string) {
        this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Loading..." });
        this.__vendorDumpService.getFileData(req).subscribe(
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
        this._initDetails = await this.__vendorDumpService.getVendorDumpInitDetails();
        if (this._initDetails && this._initDetails.lastDumpDt) {
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

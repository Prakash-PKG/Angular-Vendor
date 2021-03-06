import { InvoicePostingReportService } from './invoice-posting-report.service';
import { BusyDataModel, InvoicePostingReportDetailsModel, invoicePostingReportReqModel } from './../models/data-models';
import { Component, OnInit } from '@angular/core';
import { AppService } from './../app.service';
import { HomeService } from '../home/home.service';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl, AbstractControl } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-invoice-posting-report',
    templateUrl: './invoice-posting-report.component.html',
    styleUrls: ['./invoice-posting-report.component.scss']
})
export class InvoicePostingReportComponent implements OnInit {

    isDashboardCollapsed: boolean = true;
    _sidebarExpansionSubscription: any = null;

    invoiceList: InvoicePostingReportDetailsModel[] = [];
    totalInvoiceList: InvoicePostingReportDetailsModel[] = [];

    invoiceSearchForm: FormGroup;

    pageSize = 25;
    pageSizeOptions: number[] = [10, 25, 50, 100];

    constructor(private _homeService: HomeService,
        private _appService: AppService,
        private _formBuilder: FormBuilder,
        private _datePipe: DatePipe,
        private _invoiceReportService: InvoicePostingReportService) { }

    onInvoiceDownloadClick() {

        let startDate: string = this._datePipe.transform(this.invoiceSearchForm.get("startDate").value, this._appService.dbDateFormat);
        let endDate: string = this._datePipe.transform(this.invoiceSearchForm.get("endDate").value, this._appService.dbDateFormat);
        let req: invoicePostingReportReqModel = {
            startDate: startDate,
            endDate: endDate
        };
        let displayStartDt: string = this._datePipe.transform(new Date(), this._appService.displayDtFormat);
        let fileName: string = "invoice-posting-report-" + displayStartDt + ".xlsx";
        this.downloadInvoiceDump(req, fileName);
    }

    downloadInvoiceDump(req: invoicePostingReportReqModel, fileName: string) {
        this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Loading..." });
        this._invoiceReportService.getFileData(req).subscribe(
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

    setPageSizeOptions(setPageSizeOptionsInput: string) {
        this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
    }

    onPageChanged(e) {
        let firstCut = e.pageIndex * e.pageSize;
        let secondCut = firstCut + e.pageSize;
        this.invoiceList = this.totalInvoiceList.slice(firstCut, secondCut);
    }

    async loadInitData() {
        this.invoiceList = [];
        this.totalInvoiceList = [];

        this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Loading..." });
        this.totalInvoiceList = await this._invoiceReportService.getInvoiceSLAList();
        this.invoiceList = this.totalInvoiceList.slice(0, this.pageSize);

        this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
    }

    onClearClick() {
        this.invoiceSearchForm.reset();
        this.invoiceList = this.totalInvoiceList.slice(0, this.pageSize);
    }

    onSearchChange() {
        let invoiceNumberVal = this.invoiceSearchForm.get("invoiceNumber").value;
        let lcInvoiceNumberVal = (invoiceNumberVal) ? invoiceNumberVal.toLowerCase() : "";

        let startDateVal = this.invoiceSearchForm.get("startDate").value;

        let endDateVal = this.invoiceSearchForm.get("endDate").value;

        this.invoiceList = this.totalInvoiceList.filter(function (req) {
            if ((req.invoiceNumber && req.invoiceNumber.toString().toLowerCase().indexOf(lcInvoiceNumberVal) > -1) &&
                ((req.invEnteredDate && startDateVal) ? new Date(req.invEnteredDate) >= startDateVal : true) &&
                ((req.invEnteredDate && endDateVal) ? new Date(req.invEnteredDate) <= endDateVal : true)) {
                return true;
            }
        });

    }

    ngOnDestroy() {
        if (this._sidebarExpansionSubscription) {
            this._sidebarExpansionSubscription.unsubscribe();
        }
    }

    ngOnInit() {

        this._sidebarExpansionSubscription = this._homeService.isSidebarCollapsed.subscribe(data => {
            this.isDashboardCollapsed = !data;
        });

        this.invoiceSearchForm = this._formBuilder.group({
            invoiceNumber: null,
            startDate: null,
            endDate: null
        });

        this.invoiceSearchForm.get("invoiceNumber").valueChanges.subscribe(val => {
            this.onSearchChange();
        });

        this.invoiceSearchForm.get("startDate").valueChanges.subscribe(val => {
            this.onSearchChange();
        });

        this.invoiceSearchForm.get("endDate").valueChanges.subscribe(val => {
            this.onSearchChange();
        });

        setTimeout(() => {
            this.loadInitData();
        }, 100);
    }

}

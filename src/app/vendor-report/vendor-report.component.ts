import { Component, OnInit } from '@angular/core';
import { VendorMasterDetailsModel, BusyDataModel, VendorReportReqModel } from '../models/data-models';
import { FormGroup, FormBuilder } from '@angular/forms';
import { HomeService } from '../home/home.service';
import { AppService } from '../app.service';
import { Router } from '@angular/router';
import { VendorDashboardService } from '../vendor-dashboard/vendor-dashboard.service';
import { globalConstant } from '../common/global-constant';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-vendor-report',
  templateUrl: './vendor-report.component.html',
  styleUrls: ['./vendor-report.component.scss']
})
export class VendorReportComponent implements OnInit {
  isDashboardCollapsed: boolean = true;
  _sidebarExpansionSubscription: any = null;

  // _initDetails: VendorMasterDetailsModel = null;

  vendorList: VendorMasterDetailsModel[] = [];
  totalVendorList: VendorMasterDetailsModel[] = [];
  vendorSearchForm: FormGroup;

  pageSize = 25;
  pageSizeOptions: number[] = [10, 25, 50, 100];

  headerArr: string[] = [];

  constructor(private _homeService: HomeService,
    private _appService: AppService,
    private _router: Router,
    private _datePipe: DatePipe,
    private _formBuilder: FormBuilder,
    private _vendorDashService: VendorDashboardService) { }

  setPageSizeOptions(setPageSizeOptionsInput: string) {
    this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
  }

  onPageChanged(e) {
    let firstCut = e.pageIndex * e.pageSize;
    let secondCut = firstCut + e.pageSize;
    this.vendorList = this.totalVendorList.slice(firstCut, secondCut);
  }
  onReportDownloadClick() {
    let req: VendorReportReqModel = {
      vendorIdList: null
    };
    if (this.vendorList) {
      this.vendorList.forEach(vendor => {
        req.vendorIdList.push(vendor.vendorId)
      })
    }
    
    let displayStartDt: string = this._datePipe.transform(new Date(), this._appService.displayDtFormat);;
    let fileName: string = "Vendor-Report-" + displayStartDt + ".xlsx";
    this.downloadVendorReport(req, fileName);
  }

  downloadVendorReport(req: VendorReportReqModel, fileName: string) {
    this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Loading..." });
    this._vendorDashService.getFileData(req).subscribe(
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
  loadInitData() {
    this.vendorList = [];
    this.totalVendorList = [];

    this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Loading..." });
    this._vendorDashService.getVendorList().subscribe(response => {

      this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
      if (response.body) {
        let results: VendorMasterDetailsModel[] = response.body as VendorMasterDetailsModel[];
        this.vendorList = results;
        this.vendorList = [].concat.apply([], results);
        this.totalVendorList = this.vendorList.concat();
        this.vendorList = this.totalVendorList.slice(0, this.pageSize);

      }
    });
    (error) => {
      this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
      console.log(error);
    };
  }

  onClearClick() {
    this.vendorSearchForm.reset();
    this.vendorList = this.totalVendorList.concat();
  }

  onSearchChange() {

    this.vendorList = this.totalVendorList;

    let vendorIdVal = this.vendorSearchForm.get("vendorId").value;
    let lcvendorIdVal = (vendorIdVal) ? vendorIdVal.toLowerCase() : "";

    let vendorNameVal = this.vendorSearchForm.get("vendorName").value;
    let lcvendorNameVal = (vendorNameVal) ? vendorNameVal.toLowerCase() : "";

    this.vendorList = this.totalVendorList.filter(function (req) {
      if ((req.vendorId && req.vendorId.toString().toLowerCase().indexOf(lcvendorIdVal) > -1) &&
        (req.vendorName && req.vendorName.toString().toLowerCase().indexOf(lcvendorNameVal) > -1)) {
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
    this.isDashboardCollapsed = true;

    this._sidebarExpansionSubscription = this._homeService.isSidebarCollapsed.subscribe(data => {
      this.isDashboardCollapsed = !data;
    });


    this.vendorSearchForm = this._formBuilder.group({
      vendorId: null,
      vendorName: null
    });

    this.vendorSearchForm.get("vendorId").valueChanges.subscribe(val => {
      this.onSearchChange();
    });

    this.vendorSearchForm.get("vendorName").valueChanges.subscribe(val => {
      this.onSearchChange();
    });

    setTimeout(() => {
      this.loadInitData();
    }, 100);
  }

}
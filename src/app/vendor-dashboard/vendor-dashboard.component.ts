import { Component, OnInit } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import{VendorMasterDetailsModel, BusyDataModel} from '../../app/models/data-models'
import { HomeService } from '../home/home.service';
import { AppService } from '../app.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';
export const MY_FORMATS = {
  parse: {
      dateInput: 'LL',
  },
  display: {
      dateInput: 'LL',
      monthYearLabel: 'MMM YYYY',
      dateA11yLabel: 'LL',
      monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-vendor-dashboard',
  templateUrl: './vendor-dashboard.component.html',
  styleUrls: ['./vendor-dashboard.component.scss'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {
        provide: DateAdapter,
        useClass: MomentDateAdapter,
        deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
]
})
export class VendorDashboardComponent implements OnInit {

 
  isDashboardCollapsed: boolean = true;
  _sidebarExpansionSubscription: any = null;

  // _initDetails: VendorMasterDetailsModel = null;

  vendorList: VendorMasterDetailsModel[] = [];

  invoiceSearchForm: FormGroup;

  constructor(private _homeService: HomeService,
      private _appService: AppService,
      private _router: Router,
      private _formBuilder: FormBuilder,
      private _datePipe: DatePipe) { }

//   onInvoiceDownloadClick() {
//       let req: InvoiceSearchRequestModel = this.getPOSearchRequestData();

//       let displayStartDt: string = this._datePipe.transform(new Date(), this._appService.displayDtFormat);;
//       let fileName: string = "invoice-dump-" + displayStartDt + ".xlsx";
//       this.downloadInvoiceDump(req, fileName);
//   }

//   downloadInvoiceDump(req: InvoiceSearchRequestModel, fileName: string) {
//       this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Loading..." });
//       this._invoiceSearchService.getFileData(req).subscribe(
//           (data) => {
//               this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
//               const blob = new Blob([data.body], { type: 'application/octet-stream' });
//               const url = window.URL.createObjectURL(blob);

//               const a = document.createElement('a');
//               a.href = url;
//               a.download = fileName;
//               document.body.appendChild(a);
//               a.click();
//           },
//           error => {
//               console.log(error);
//               this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
//           });
//   }

//   onInvoiceClick(inv: InvoiceModel) {
//       this._appService.selectedInvoice = inv;
//       this._router.navigate([this._appService.routingConstants.invoiceDetails]);
//   }

  getFormattedDate(dtStr: string) {
      if (dtStr) {
          return this._appService.getFormattedDate(dtStr);
      }

      return "";
  }

  async loadInitData() {
      this.vendorList = [];

      this._homeService.updateBusy(<BusyDataModel>{ isBusy: true, msg: "Loading..." });
    //   this.vendorList = await this._invoiceSearchService.getInvoiceList(req).subscribe(result=>{
    //   });

      this._homeService.updateBusy(<BusyDataModel>{ isBusy: false, msg: null });
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

      setTimeout(() => {
          this.loadInitData();
      }, 100);
  }

}


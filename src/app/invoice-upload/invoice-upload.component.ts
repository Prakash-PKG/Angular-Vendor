import { Component, OnInit } from '@angular/core';
import { HomeService } from '../home/home.service';

@Component({
  selector: 'app-invoice-upload',
  templateUrl: './invoice-upload.component.html',
  styleUrls: ['./invoice-upload.component.scss']
})
export class InvoiceUploadComponent implements OnInit {
  
  isDashboardCollapsed: boolean = true;
  _sidebarExpansionSubscription: any = null;
  
  headerArr: string[] = ['Item No.', 'Item Desc', 'Order Qty', 'Supplied Qty', 'Balance Qty', 'Invoive Qty', 'Rate', 'Amount'];
  
  constructor(private _homeService: HomeService) { }
  
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
  }

}

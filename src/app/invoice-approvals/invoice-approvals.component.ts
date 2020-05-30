import { Component, OnInit } from '@angular/core';
import { HomeService } from '../home/home.service';

@Component({
  selector: 'app-invoice-approvals',
  templateUrl: './invoice-approvals.component.html',
  styleUrls: ['./invoice-approvals.component.scss']
})
export class InvoiceApprovalsComponent implements OnInit {
  isDashboardCollapsed: boolean = true;
  _sidebarExpansionSubscription: any = null;

  headerArr: string[] = ['po', 'vendorid', 'vendorname', 'podate', 'currency', 'totalamt', 'billedamt', 'payrec'];

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

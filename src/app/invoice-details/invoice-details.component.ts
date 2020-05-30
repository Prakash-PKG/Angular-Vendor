import { Component, OnInit } from '@angular/core';
import { HomeService } from '../home/home.service';

@Component({
  selector: 'app-invoice-details',
  templateUrl: './invoice-details.component.html',
  styleUrls: ['./invoice-details.component.scss']
})
export class InvoiceDetailsComponent implements OnInit {
  isDashboardCollapsed: boolean = true;
  _sidebarExpansionSubscription: any = null;

  statusHeaderArr: string[] = ['po', 'vendorid', 'vendorname', 'podate'];
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

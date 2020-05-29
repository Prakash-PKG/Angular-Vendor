import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort, MatTableDataSource } from '@angular/material';
import { HomeService } from '../home/home.service';

@Component({
  selector: 'app-invoice-search',
  templateUrl: './invoice-search.component.html',
  styleUrls: ['./invoice-search.component.scss']
})
export class InvoiceSearchComponent implements OnInit {

  isDashboardCollapsed: boolean = true;
  _sidebarExpansionSubscription: any = null;

  headerArr: string[] = ['po', 'vendorid', 'vendorname', 'invNo', 'invdate', 'currency', 'totalamt', 'orderqty', 'suppliedqty', 'balanceqty', 'invqty', 'rate', 'amt', 'status'];
  
  invData = new MatTableDataSource(DATA);

  @ViewChild(MatSort) sort: MatSort;

  constructor(private _homeService: HomeService) { }

  ngOnDestroy() {
    if (this._sidebarExpansionSubscription) {
      this._sidebarExpansionSubscription.unsubscribe();
    }
  }

  ngOnInit() {
    this.isDashboardCollapsed = true;
    this.invData.sort = this.sort;

    this._sidebarExpansionSubscription = this._homeService.isSidebarCollapsed.subscribe(data => {
      this.isDashboardCollapsed = !data;
    });
  }

}
//data model
export interface InvDataModel {

}

const DATA: InvDataModel[] = [
];
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort, MatTableDataSource, MatDialog } from '@angular/material';
import { HomeService } from '../home/home.service';
import { AppService } from '../app.service';
import { PoSearchService } from './po-search.service';
import { POSearchResultModel } from '../models/data-models';

@Component({
  selector: 'app-po-search',
  templateUrl: './po-search.component.html',
  styleUrls: ['./po-search.component.scss']
})
export class PoSearchComponent implements OnInit {

  headerArr: string[] = ['po', 'vendorid', 'vendorname', 'podate', 'currency', 'totalamt', 'billedamt', 'payrec', 'status'];
  purchaseOrders: POSearchResultModel[] = [];
  purcahseOrderData = new MatTableDataSource<POSearchResultModel>(this.purchaseOrders);

  @ViewChild(MatSort) sort: MatSort;

  isDashboardCollapsed: boolean = true;
  _sidebarExpansionSubscription: any = null;

  constructor(public dialog: MatDialog,
    private _homeService: HomeService,
    private _appService: AppService,
    private _poSearchService: PoSearchService) { }

  loadPurchaseOrders() {
    this._poSearchService.getPurchaseOrders()
      .subscribe(response => {
        this.purchaseOrders = response.body as POSearchResultModel[];
        this.purcahseOrderData.sort = this.sort;
      },
        (error) => {
          console.log(error);
        });
  }
  applySearch(filterValue: string) {
    this.purcahseOrderData.filter = filterValue.trim().toLowerCase();
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
    this.loadPurchaseOrders();
  }

}

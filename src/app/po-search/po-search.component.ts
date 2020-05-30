import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort, MatTableDataSource } from '@angular/material';
import { HomeService } from '../home/home.service';

@Component({
  selector: 'app-po-search',
  templateUrl: './po-search.component.html',
  styleUrls: ['./po-search.component.scss']
})
export class PoSearchComponent implements OnInit {

  headerArr: string[] = ['po', 'vendorid', 'vendorname', 'podate', 'currency', 'totalamt', 'billedamt', 'payrec', 'status'];
  poData = new MatTableDataSource(PODATA);

  @ViewChild(MatSort) sort: MatSort;

  isDashboardCollapsed: boolean = true;
  _sidebarExpansionSubscription: any = null;

  constructor(private _homeService: HomeService) { }

  ngOnDestroy() {
    if (this._sidebarExpansionSubscription) {
      this._sidebarExpansionSubscription.unsubscribe();
    }
  }

  ngOnInit() {
    this.poData.sort = this.sort;
    this.isDashboardCollapsed = true;

    this._sidebarExpansionSubscription = this._homeService.isSidebarCollapsed.subscribe(data => {
      this.isDashboardCollapsed = !data;
    });
  }
}
//data model
export interface PODataModel {

}

const PODATA: PODataModel[] = [
];
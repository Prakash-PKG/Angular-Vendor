import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort, MatTableDataSource } from '@angular/material';

@Component({
  selector: 'app-po-search',
  templateUrl: './po-search.component.html',
  styleUrls: ['./po-search.component.scss']
})
export class PoSearchComponent implements OnInit {

  headerArr: string[] = ['po', 'vendorid', 'vendorname', 'podate','currency','totalamt','billedamt','payrec','status'];
  poData = new MatTableDataSource(DATA);
 
  @ViewChild(MatSort) sort: MatSort;
  
  constructor() { }

  ngOnInit() {
    this.poData.sort = this.sort;
  }

}
//data model
export interface PODataModel {

}

const DATA: PODataModel[] = [
];
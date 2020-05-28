import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort, MatTableDataSource } from '@angular/material';

@Component({
  selector: 'app-invoice-search',
  templateUrl: './invoice-search.component.html',
  styleUrls: ['./invoice-search.component.scss']
})
export class InvoiceSearchComponent implements OnInit {

  headerArr: string[] = ['po', 'vendorid', 'vendorname', 'invNo','invdate','currency','totalamt','orderqty','suppliedqty','balanceqty','invqty','rate','amt','status'];
  invData = new MatTableDataSource(DATA);

  @ViewChild(MatSort) sort: MatSort;

  constructor() { }

  ngOnInit() {
    this.invData.sort = this.sort;
  }

}
//data model
export interface InvDataModel {

}

const DATA: InvDataModel[] = [
];
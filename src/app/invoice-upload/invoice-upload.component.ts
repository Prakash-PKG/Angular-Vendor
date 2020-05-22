import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-invoice-upload',
  templateUrl: './invoice-upload.component.html',
  styleUrls: ['./invoice-upload.component.scss']
})
export class InvoiceUploadComponent implements OnInit {
  headerArr: string[] = ['Item No.', 'Item Desc', 'Order Qty', 'Supplied Qty', 'Balance Qty', 'Invoive Qty', 'Rate', 'Amount'];
  constructor() { }

  ngOnInit() {
  }

}

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoicePostingReportComponent } from './invoice-posting-report.component';

describe('InvoicePostingReportComponent', () => {
  let component: InvoicePostingReportComponent;
  let fixture: ComponentFixture<InvoicePostingReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoicePostingReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoicePostingReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

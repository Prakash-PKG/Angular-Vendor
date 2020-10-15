import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceSlaReportComponent } from './invoice-sla-report.component';

describe('InvoiceSlaReportComponent', () => {
  let component: InvoiceSlaReportComponent;
  let fixture: ComponentFixture<InvoiceSlaReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoiceSlaReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceSlaReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

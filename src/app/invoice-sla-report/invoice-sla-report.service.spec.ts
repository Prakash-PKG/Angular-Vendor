import { TestBed } from '@angular/core/testing';

import { InvoiceSlaReportService } from './invoice-sla-report.service';

describe('InvoiceSlaReportService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: InvoiceSlaReportService = TestBed.get(InvoiceSlaReportService);
    expect(service).toBeTruthy();
  });
});

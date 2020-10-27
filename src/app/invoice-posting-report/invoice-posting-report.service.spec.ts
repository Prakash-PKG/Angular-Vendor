import { TestBed } from '@angular/core/testing';

import { InvoicePostingReportService } from './invoice-posting-report.service';

describe('InvoicePostingReportService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: InvoicePostingReportService = TestBed.get(InvoicePostingReportService);
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { InvoiceApprovalsService } from './invoice-approvals.service';

describe('InvoiceApprovalsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: InvoiceApprovalsService = TestBed.get(InvoiceApprovalsService);
    expect(service).toBeTruthy();
  });
});

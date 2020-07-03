import { TestBed } from '@angular/core/testing';

import { NonPoInvoiceDumpService } from './non-po-invoice-dump.service';

describe('NonPoInvoiceDumpService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NonPoInvoiceDumpService = TestBed.get(NonPoInvoiceDumpService);
    expect(service).toBeTruthy();
  });
});

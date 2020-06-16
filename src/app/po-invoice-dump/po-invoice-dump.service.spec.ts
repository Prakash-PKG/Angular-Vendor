import { TestBed } from '@angular/core/testing';

import { PoInvoiceDumpService } from './po-invoice-dump.service';

describe('PoInvoiceDumpService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PoInvoiceDumpService = TestBed.get(PoInvoiceDumpService);
    expect(service).toBeTruthy();
  });
});

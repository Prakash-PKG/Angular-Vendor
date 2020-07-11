import { TestBed } from '@angular/core/testing';

import { InvoiceSearchService } from './invoice-search.service';

describe('InvoiceSearchService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: InvoiceSearchService = TestBed.get(InvoiceSearchService);
    expect(service).toBeTruthy();
  });
});

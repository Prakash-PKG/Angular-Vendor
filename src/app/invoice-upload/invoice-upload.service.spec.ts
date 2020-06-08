import { TestBed } from '@angular/core/testing';

import { InvoiceUploadService } from './invoice-upload.service';

describe('InvoiceUploadService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: InvoiceUploadService = TestBed.get(InvoiceUploadService);
    expect(service).toBeTruthy();
  });
});

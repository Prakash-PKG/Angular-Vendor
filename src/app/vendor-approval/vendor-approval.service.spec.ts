import { TestBed } from '@angular/core/testing';

import { VendorApprovalService } from './vendor-approval.service';

describe('VendorApprovalService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: VendorApprovalService = TestBed.get(VendorApprovalService);
    expect(service).toBeTruthy();
  });
});

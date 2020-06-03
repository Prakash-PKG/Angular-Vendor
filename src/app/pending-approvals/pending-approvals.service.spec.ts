import { TestBed } from '@angular/core/testing';

import { PendingApprovalsService } from './pending-approvals.service';

describe('PendingApprovalsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PendingApprovalsService = TestBed.get(PendingApprovalsService);
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { VendorRegistrationService } from './vendor-registration.service';

describe('VendorRegistrationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: VendorRegistrationService = TestBed.get(VendorRegistrationService);
    expect(service).toBeTruthy();
  });
});

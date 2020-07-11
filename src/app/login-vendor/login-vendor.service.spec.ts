import { TestBed } from '@angular/core/testing';

import { LoginVendorService } from './login-vendor.service';

describe('LoginVendorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LoginVendorService = TestBed.get(LoginVendorService);
    expect(service).toBeTruthy();
  });
});

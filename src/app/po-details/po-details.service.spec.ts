import { TestBed } from '@angular/core/testing';

import { PoDetailsService } from './po-details.service';

describe('PoDetailsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PoDetailsService = TestBed.get(PoDetailsService);
    expect(service).toBeTruthy();
  });
});

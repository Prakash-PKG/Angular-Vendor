import { TestBed } from '@angular/core/testing';

import { PoSearchService } from './po-search.service';

describe('PoSearchService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PoSearchService = TestBed.get(PoSearchService);
    expect(service).toBeTruthy();
  });
});

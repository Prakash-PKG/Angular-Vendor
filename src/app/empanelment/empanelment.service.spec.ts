import { TestBed } from '@angular/core/testing';

import { EmpanelmentService } from './empanelment.service';

describe('EmpanelmentService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EmpanelmentService = TestBed.get(EmpanelmentService);
    expect(service).toBeTruthy();
  });
});

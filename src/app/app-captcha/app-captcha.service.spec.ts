import { TestBed } from '@angular/core/testing';

import { AppCaptchaService } from './app-captcha.service';

describe('AppCaptchaService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AppCaptchaService = TestBed.get(AppCaptchaService);
    expect(service).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppCaptchaComponent } from './app-captcha.component';

describe('AppCaptchaComponent', () => {
  let component: AppCaptchaComponent;
  let fixture: ComponentFixture<AppCaptchaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppCaptchaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppCaptchaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

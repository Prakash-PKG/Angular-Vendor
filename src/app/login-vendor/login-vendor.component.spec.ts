import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginVendorComponent } from './login-vendor.component';

describe('LoginVendorComponent', () => {
  let component: LoginVendorComponent;
  let fixture: ComponentFixture<LoginVendorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginVendorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginVendorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

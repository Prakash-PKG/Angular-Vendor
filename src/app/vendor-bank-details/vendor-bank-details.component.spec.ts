import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorBankDetailsComponent } from './vendor-bank-details.component';

describe('VendorBankDetailsComponent', () => {
  let component: VendorBankDetailsComponent;
  let fixture: ComponentFixture<VendorBankDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VendorBankDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VendorBankDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

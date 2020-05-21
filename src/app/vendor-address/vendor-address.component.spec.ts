import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorAddressComponent } from './vendor-address.component';

describe('VendorAddressComponent', () => {
  let component: VendorAddressComponent;
  let fixture: ComponentFixture<VendorAddressComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VendorAddressComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VendorAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

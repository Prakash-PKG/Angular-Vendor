import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorDumpComponent } from './vendor-dump.component';

describe('VendorDumpComponent', () => {
  let component: VendorDumpComponent;
  let fixture: ComponentFixture<VendorDumpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VendorDumpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VendorDumpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

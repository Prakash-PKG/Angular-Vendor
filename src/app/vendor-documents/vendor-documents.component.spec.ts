import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorDocumentsComponent } from './vendor-documents.component';

describe('VendorDocumentsComponent', () => {
  let component: VendorDocumentsComponent;
  let fixture: ComponentFixture<VendorDocumentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VendorDocumentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VendorDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

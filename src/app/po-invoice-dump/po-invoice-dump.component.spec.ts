import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PoInvoiceDumpComponent } from './po-invoice-dump.component';

describe('PoInvoiceDumpComponent', () => {
  let component: PoInvoiceDumpComponent;
  let fixture: ComponentFixture<PoInvoiceDumpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PoInvoiceDumpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PoInvoiceDumpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

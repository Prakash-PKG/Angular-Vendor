import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NonPoInvoiceDumpComponent } from './non-po-invoice-dump.component';

describe('NonPoInvoiceDumpComponent', () => {
  let component: NonPoInvoiceDumpComponent;
  let fixture: ComponentFixture<NonPoInvoiceDumpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NonPoInvoiceDumpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NonPoInvoiceDumpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

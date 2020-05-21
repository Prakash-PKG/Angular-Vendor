import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceApprovalsComponent } from './invoice-approvals.component';

describe('InvoiceApprovalsComponent', () => {
  let component: InvoiceApprovalsComponent;
  let fixture: ComponentFixture<InvoiceApprovalsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoiceApprovalsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceApprovalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

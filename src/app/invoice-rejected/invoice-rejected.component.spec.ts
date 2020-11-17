import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceRejectedComponent } from './invoice-rejected.component';

describe('InvoiceRejectedComponent', () => {
  let component: InvoiceRejectedComponent;
  let fixture: ComponentFixture<InvoiceRejectedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoiceRejectedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceRejectedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

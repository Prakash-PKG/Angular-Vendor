import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceCommunicationDialogComponent } from './invoice-communication-dialog.component';

describe('InvoiceCommunicationDialogComponent', () => {
  let component: InvoiceCommunicationDialogComponent;
  let fixture: ComponentFixture<InvoiceCommunicationDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoiceCommunicationDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceCommunicationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

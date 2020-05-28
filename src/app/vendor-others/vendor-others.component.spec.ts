import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorOthersComponent } from './vendor-others.component';

describe('VendorOthersComponent', () => {
  let component: VendorOthersComponent;
  let fixture: ComponentFixture<VendorOthersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VendorOthersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VendorOthersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

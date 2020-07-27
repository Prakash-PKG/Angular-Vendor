import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GrnSesItemsComponent } from './grn-ses-items.component';

describe('GrnSesItemsComponent', () => {
  let component: GrnSesItemsComponent;
  let fixture: ComponentFixture<GrnSesItemsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GrnSesItemsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GrnSesItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

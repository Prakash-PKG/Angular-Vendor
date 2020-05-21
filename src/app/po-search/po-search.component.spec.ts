import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PoSearchComponent } from './po-search.component';

describe('PoSearchComponent', () => {
  let component: PoSearchComponent;
  let fixture: ComponentFixture<PoSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PoSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PoSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

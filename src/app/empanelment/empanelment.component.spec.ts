import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpanelmentComponent } from './empanelment.component';

describe('EmpanelmentComponent', () => {
  let component: EmpanelmentComponent;
  let fixture: ComponentFixture<EmpanelmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmpanelmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmpanelmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

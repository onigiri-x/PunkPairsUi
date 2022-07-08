import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PunkViewComponent } from './punk-view.component';

describe('PunkViewComponent', () => {
  let component: PunkViewComponent;
  let fixture: ComponentFixture<PunkViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PunkViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PunkViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

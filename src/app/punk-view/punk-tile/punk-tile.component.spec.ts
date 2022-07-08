import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PunkTileComponent } from './punk-tile.component';

describe('PunkTileComponent', () => {
  let component: PunkTileComponent;
  let fixture: ComponentFixture<PunkTileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PunkTileComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PunkTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

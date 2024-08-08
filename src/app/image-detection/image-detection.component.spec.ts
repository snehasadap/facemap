import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageDetectionComponent } from './image-detection.component';

describe('ImageDetectionComponent', () => {
  let component: ImageDetectionComponent;
  let fixture: ComponentFixture<ImageDetectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageDetectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageDetectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

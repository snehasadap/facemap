import { Routes } from '@angular/router';
import { FacialRecognitionComponent } from './facial-recognition/facial-recognition.component';
import { ImageDetectionComponent } from './image-detection/image-detection.component';

export const routes: Routes = [
  { path: '', redirectTo: '/webcam-detection', pathMatch: 'full' },
  { path: 'webcam-detection', component: FacialRecognitionComponent, data: { title: 'Webcam Detection' } },
  { path: 'image-detection', component: ImageDetectionComponent, data: { title: 'Image Detection' } }
];

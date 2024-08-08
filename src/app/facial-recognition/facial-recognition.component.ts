import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import * as faceapi from '@vladmandic/face-api';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-facial-recognition',
  templateUrl: './facial-recognition.component.html',  // Reference to the external HTML file
  styleUrls: ['./facial-recognition.component.css'], // Ensure styles are linked if they are in a separate file
  imports: [CommonModule],
  standalone: true
})
export class FacialRecognitionComponent implements AfterViewInit, OnDestroy {
  @ViewChild('videoElement', { static: true }) videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  private intervalId: number | undefined;
  public isWebcamActive: boolean = false; // Changed to public to be accessed in the template

  async ngAfterViewInit(): Promise<void> {
    console.log('Component initialized - Models will load when the webcam starts.');
  }

  ngOnDestroy(): void {
    this.stopCamera(); // Ensure the webcam and intervals are stopped when the component is destroyed
  }

  async loadModels(): Promise<void> {
    const modelPath = '/assets/models';
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(modelPath),
        faceapi.nets.faceLandmark68Net.loadFromUri(modelPath),
        faceapi.nets.faceExpressionNet.loadFromUri(modelPath),
        faceapi.nets.ageGenderNet.loadFromUri(modelPath)
      ]);
      console.log('Models loaded successfully');
    } catch (error) {
      console.error('Failed to load models:', error);
    }
  }

  toggleWebcam(event: Event): void {
    const checkbox = event.target as HTMLInputElement; // Cast the target to an HTMLInputElement
    const isChecked = checkbox.checked; // Safely access the 'checked' property
    if (isChecked) {
      this.startCamera();
    } else {
      this.stopCamera();
    }
  }

  private async startCamera(): Promise<void> {
    await this.loadModels();
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        this.videoElement.nativeElement.srcObject = stream;
        this.videoElement.nativeElement.play().then(() => {
          this.startFaceDetection();
          this.isWebcamActive = true;
        });
      })
      .catch(error => {
        console.error('Error accessing the camera:', error);
        this.isWebcamActive = false;
      });
  }

  private stopCamera(): void {
    if (this.videoElement.nativeElement.srcObject) {
      const tracks = (this.videoElement.nativeElement.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      this.videoElement.nativeElement.srcObject = null;
      this.isWebcamActive = false;
    }
    if (this.intervalId) {
      clearInterval(this.intervalId);
      const context = this.canvas.nativeElement.getContext('2d');
      if (context) {
        context.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
      }
    }
    console.log('Webcam stopped');
  }

  private startFaceDetection(): void {
    const video = this.videoElement.nativeElement;
    const canvasElement = this.canvas.nativeElement;
    canvasElement.width = video.videoWidth;
    canvasElement.height = video.videoHeight;
    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    faceapi.matchDimensions(canvasElement, displaySize);
  
    this.intervalId = window.setInterval(async () => {
      const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions()
        .withAgeAndGender(); // Ensure age and gender are included in the detection
  
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      const context = canvasElement.getContext('2d');
      if (context) {
        context.clearRect(0, 0, canvasElement.width, canvasElement.height);
        faceapi.draw.drawDetections(canvasElement, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvasElement, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvasElement, resizedDetections);
        // Additional drawing for age and gender
        resizedDetections.forEach(detection => {
          const { age, gender, genderProbability } = detection;
          const text = `${Math.round(age)} years old ${gender} (${Math.round(genderProbability * 100)}%)`;
          new faceapi.draw.DrawTextField(
            [text], detection.detection.box.bottomRight
          ).draw(canvasElement);
        });
      }
    }, 100);
  }
  
}

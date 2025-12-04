/** Angular Imports */
import { Component, ViewChild, ElementRef, AfterViewInit, Renderer2, OnDestroy } from '@angular/core';
import { MatDialogRef, MatDialogTitle, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { NgStyle, NgIf } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Capture image dialog component
 */
@Component({
  selector: 'mifosx-capture-image-dialog',
  templateUrl: './capture-image-dialog.component.html',
  styleUrls: ['./capture-image-dialog.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    NgStyle,
    FaIconComponent,
    MatDialogActions,
    MatDialogClose
  ]
})
export class CaptureImageDialogComponent implements AfterViewInit, OnDestroy {
  /** Video element reference */
  @ViewChild('video', { static: true }) video: ElementRef;
  /** Canvas element reference */
  @ViewChild('canvas', { static: true }) canvas: ElementRef;
  /** Fallback element reference */
  @ViewChild('fallback', { static: true }) fallback: ElementRef;
  /** Capture button element reference */
  @ViewChild('captureButton') captureButton: ElementRef;

  /** Toggles button states */
  isCaptured = false;
  /** Client image file */
  clientImageDataURL: string;

  /**
   * @param {MatDialogRef} dialogRef Mat Dialog Reference
   * @param {Renderer2} renderer Template Renderer
   */
  constructor(
    public dialogRef: MatDialogRef<CaptureImageDialogComponent>,
    private renderer: Renderer2
  ) {}

  ngAfterViewInit() {
    this.startCamera();
  }

  ngOnDestroy() {
    this.stopCamera();
  }

  /**
   * Initializes camera video stream once user grants permission.
   * Sets fallback if permission not granted.
   * See https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices for configuration details.
   */
  startCamera() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const videoConstraints: MediaTrackConstraints = {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: 'user'
      };
      navigator.mediaDevices
        .getUserMedia({ video: videoConstraints })
        .then((stream: MediaStream) => {
          this.renderer.setProperty(this.video.nativeElement, 'srcObject', stream);
          this.video.nativeElement.play();
        })
        .catch((error: Error) => {
          this.handleError(error);
        });
    } else {
      throw new Error('Cannot connect to camera');
    }
  }

  /**
   * Shows fallback message.
   * @param {Error} error Error
   */
  handleError(error: Error) {
    this.renderer.removeStyle(this.fallback.nativeElement, 'display');
    const fallbackMessage = this.renderer.createText(`${error.name}: ${error.message}`);
    this.renderer.appendChild(this.fallback.nativeElement, fallbackMessage);
    this.renderer.setStyle(this.video.nativeElement, 'display', 'none');
    this.renderer.setProperty(this.captureButton, 'disabled', 'true');
  }

  /**
   * Stops video stream and closes the camera.
   * See https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack for `MediaStreamTrack` properties.
   */
  stopCamera() {
    const stream: MediaStream = this.video.nativeElement.srcObject;
    if (stream) {
      const videoStream: MediaStreamTrack = stream.getTracks()[0];
      videoStream.stop();
    }
    this.renderer.setProperty(this.video.nativeElement, 'srcObject', null);
  }

  /**
   * Captures the image by drawing video state on canvas, then converts canvas state to data URL.
   * Uses actual video dimensions to prevent aspect ratio distortion.
   * See https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL for details.
   */
  capture() {
    this.isCaptured = true;
    this.video.nativeElement.pause();

    // Get actual video stream dimensions to preserve aspect ratio
    const videoWidth = this.video.nativeElement.videoWidth;
    const videoHeight = this.video.nativeElement.videoHeight;

    // Set canvas dimensions to match video stream
    this.canvas.nativeElement.width = videoWidth;
    this.canvas.nativeElement.height = videoHeight;

    // Draw the video frame at full resolution without distortion
    this.canvas.nativeElement.getContext('2d').drawImage(this.video.nativeElement, 0, 0, videoWidth, videoHeight);

    // Convert to data URL with JPEG format for smaller file size
    this.clientImageDataURL = this.canvas.nativeElement.toDataURL('image/jpeg', 0.9);
  }

  /**
   * Allows user to capture image again.
   */
  recapture() {
    this.isCaptured = false;
    this.video.nativeElement.play();
  }
}

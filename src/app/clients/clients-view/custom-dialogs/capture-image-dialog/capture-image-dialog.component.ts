/** Angular Imports */
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Renderer2, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatomoTracker } from "@ngx-matomo/tracker";


/**
 * Capture image dialog component
 */
@Component({
  selector: 'mifosx-capture-image-dialog',
  templateUrl: './capture-image-dialog.component.html',
  styleUrls: ['./capture-image-dialog.component.scss']
})
export class CaptureImageDialogComponent implements OnInit, AfterViewInit, OnDestroy {

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
   * @param {MatomoTracker} matomoTracker Matomo tracker service
   */
  constructor(public dialogRef: MatDialogRef<CaptureImageDialogComponent>,
    private renderer: Renderer2,
    private matomoTracker: MatomoTracker) { }

  ngOnInit() {
    //set Matomo page info
    let title = document.title || "";
    this.matomoTracker.setDocumentTitle(`${title}`);

  }
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
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream: MediaStream) => {
          this.renderer.setProperty(this.video.nativeElement, 'srcObject', stream);
          this.video.nativeElement.play();

          //Track Matomo event for camera connection success
          this.matomoTracker.trackEvent('clients', 'cameraStarted');
        })
        .catch((error: Error) => {
          this.handleError(error);
        });
    } else {
      //Track Matomo event for camera connection failure
      this.matomoTracker.trackEvent('clients', 'cameraFailed');

      throw new Error('Cannot connect to camera');
    }
  }

  /**
   * Shows fallback message.
   * @param {Error} error Error
   */
  handleError(error: Error) {

    //Track Matomo event for camera error
    this.matomoTracker.trackEvent('clients', 'cameraError');

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
    //Track Matomo event for stopping camera
    this.matomoTracker.trackEvent('clients', 'cameraStopped');

    const stream: MediaStream = this.video.nativeElement.srcObject;
    if (stream) {
      const videoStream: MediaStreamTrack = stream.getTracks()[0];
      videoStream.stop();
    }
    this.renderer.setProperty(this.video.nativeElement, 'srcObject', null);
  }

  /**
   * Captures the image by drawing video state on canvas, then converts canvas state to data URL.
   * See https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL for details.
   */
  capture() {
    this.isCaptured = true;
    this.video.nativeElement.pause();
    this.canvas.nativeElement.getContext('2d').drawImage(this.video.nativeElement, 0, 0, 150, 150);
    this.clientImageDataURL = this.canvas.nativeElement.toDataURL();

    //Track Matomo event for camera image capture
    this.matomoTracker.trackEvent('clients', 'cameraCapture');
  }

  /**
   * Allows user to capture image again.
   */
  recapture() {
    this.isCaptured = false;
    this.video.nativeElement.play();

    //Track Matomo event for camera image capture
    this.matomoTracker.trackEvent('clients', 'cameraReCapture');
  }

}

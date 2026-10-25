/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faEraser, faPen } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

import { DrawSignatureDialogComponent, SignatureTool } from './draw-signature-dialog.component';

describe('DrawSignatureDialogComponent', () => {
  let component: DrawSignatureDialogComponent;
  let fixture: ComponentFixture<DrawSignatureDialogComponent>;
  let dialogRef: { close: jest.Mock };
  let canvasContext: any;
  /** globalCompositeOperation in effect at every paint call (ctx.stroke()/ctx.fill()) */
  let strokeCompositeOps: string[];
  /** Whether the mocked canvas currently holds visible ink */
  let canvasHasInk: boolean;

  /** Whether a pen color is the opaque white used by the eraser preview */
  const isWhite = (color: unknown) => {
    const value = String(color).replace(/\s+/g, '').toLowerCase();
    return value === 'rgb(255,255,255)' || value === 'rgba(255,255,255,1)' || value === '#ffffff';
  };

  /**
   * Builds a mock 2D context that keeps compositing state realistic
   * (save/restore aware) and records the composite mode used per stroke.
   */
  const createMockContext = () => {
    const state: Record<string, any> = {
      globalCompositeOperation: 'source-over',
      fillStyle: '#000000',
      strokeStyle: '#000000',
      lineWidth: 1,
      lineCap: 'butt',
      lineJoin: 'miter'
    };
    const stack: any[] = [];
    const ctx: any = {
      clearRect: jest.fn(() => {
        // Wiping the canvas also wipes every visible pixel
        canvasHasInk = false;
      }),
      fillRect: jest.fn(),
      beginPath: jest.fn(),
      closePath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      quadraticCurveTo: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(() => {
        strokeCompositeOps.push(state.globalCompositeOperation);
        // Curved strokes are rendered by filling arcs in the pen colour,
        // so filled shapes are what leaves ink on the canvas
        if (state.globalCompositeOperation === 'source-over' && !isWhite(state.fillStyle)) {
          canvasHasInk = true;
        }
      }),
      stroke: jest.fn(() => {
        strokeCompositeOps.push(state.globalCompositeOperation);
        // Only a non-white source-over stroke leaves visible ink on the canvas
        if (state.globalCompositeOperation === 'source-over' && !isWhite(state.strokeStyle)) {
          canvasHasInk = true;
        }
      }),
      scale: jest.fn(),
      drawImage: jest.fn(),
      save: jest.fn(() => stack.push({ ...state })),
      restore: jest.fn(() => {
        const previous = stack.pop();
        if (previous) {
          Object.assign(state, previous);
        }
      }),
      getImageData: jest.fn(() => {
        return {
          data: canvasHasInk
            ? new Uint8ClampedArray([
                0,
                0,
                0,
                255
              ])
            : new Uint8ClampedArray([
                255,
                255,
                255,
                255
              ]),
          width: 1,
          height: 1
        };
      })
    };
    for (const property of Object.keys(state)) {
      Object.defineProperty(ctx, property, {
        get: () => state[property],
        set: (value: any) => {
          state[property] = value;
        }
      });
    }
    return ctx;
  };

  /** Dispatches a full stroke (down, moves, up) through the pad's mouse event pipeline */
  const stroke = (points: Array<[
        number,
        number
      ]>) => {
    const canvas = fixture.debugElement.query(By.css('canvas')).nativeElement;
    const [
      start,
      ...rest
    ] = points;
    const end = rest.length > 0 ? rest[rest.length - 1] : start;
    canvas.dispatchEvent(
      new MouseEvent('mousedown', { bubbles: true, cancelable: true, buttons: 1, clientX: start[0], clientY: start[1] })
    );
    for (const [
      x,
      y
    ] of rest) {
      window.dispatchEvent(
        new MouseEvent('mousemove', { bubbles: true, cancelable: true, buttons: 1, clientX: x, clientY: y })
      );
    }
    window.dispatchEvent(
      new MouseEvent('mouseup', { bubbles: true, cancelable: true, buttons: 0, clientX: end[0], clientY: end[1] })
    );
    fixture.detectChanges();
  };

  /** A long horizontal stroke across the canvas */
  const drawSignatureLine = () => {
    stroke([
      [
        10,
        100
      ],
      [
        70,
        100
      ],
      [
        130,
        100
      ],
      [
        190,
        100
      ],
      [
        250,
        100
      ],
      [
        300,
        100
      ]
    ]);
  };

  /** The toggle button of a tool, addressed by its stable test id */
  const toolButton = (tool: SignatureTool) =>
    fixture.debugElement.query(By.css(`[data-testid="signature-tool-${tool}"] button`));

  /** Selects a tool through the toggle group the same way a user click would */
  const selectTool = (tool: SignatureTool) => {
    toolButton(tool).nativeElement.click();
    fixture.detectChanges();
  };

  /** Confirm button state as bound by the template */
  const confirmDisabled = () =>
    fixture.debugElement.query(By.css('[data-testid="signature-confirm"]')).nativeElement.disabled;

  const countStrokesWithComposite = (composite: string) => strokeCompositeOps.filter((op) => op === composite).length;

  beforeEach(() => {
    strokeCompositeOps = [];
    canvasHasInk = false;
    (window as any).PointerEvent = undefined;
    canvasContext = createMockContext();
    dialogRef = { close: jest.fn() };

    jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(canvasContext);
    (HTMLCanvasElement.prototype as any).toBlob = jest.fn(function (this: HTMLCanvasElement, callback: any) {
      callback(new Blob(['signature'], { type: 'image/png' }));
    });

    TestBed.configureTestingModule({
      imports: [
        DrawSignatureDialogComponent,
        NoopAnimationsModule,
        TranslateModule.forRoot()
      ],
      providers: [{ provide: MatDialogRef, useValue: dialogRef }]
    }).compileComponents();

    TestBed.inject(FaIconLibrary).addIcons(faPen, faEraser);

    fixture = TestBed.createComponent(DrawSignatureDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('starts in draw mode with an empty pad and confirm disabled', () => {
    expect(component.tool).toBe('draw');
    expect(component.isEmpty).toBe(true);

    expect(toolButton('draw').nativeElement.getAttribute('aria-checked')).toBe('true');
    expect(toolButton('erase').nativeElement.getAttribute('aria-checked')).toBe('false');
    expect(confirmDisabled()).toBe(true);
  });

  it('records drawn strokes and enables confirm', () => {
    drawSignatureLine();

    expect(component.isEmpty).toBe(false);
    expect(component['strokes'].length).toBe(1);
    expect(component['strokes'][0].tool).toBe('draw');
    expect(confirmDisabled()).toBe(false);
  });

  it('switches to eraser through the toggle group and previews erasing in white', () => {
    selectTool('erase');

    expect(component.tool).toBe('erase');
    expect(component['signaturePad'].penColor).toBe('rgb(255, 255, 255)');
    expect(toolButton('draw').nativeElement.getAttribute('aria-checked')).toBe('false');
    expect(toolButton('erase').nativeElement.getAttribute('aria-checked')).toBe('true');
  });

  it('erases only the covered portions and keeps the rest of the signature', () => {
    drawSignatureLine();
    selectTool('erase');
    // Erase a small vertical slice through the middle of the line
    stroke([
      [
        150,
        60
      ],
      [
        150,
        85
      ],
      [
        150,
        115
      ],
      [
        150,
        140
      ]
    ]);

    // The eraser is replayed through SignaturePad like the live preview, never
    // through a separate destination-out path that could drift from it.
    expect(countStrokesWithComposite('destination-out')).toBe(0);
    // Remaining content keeps the pad non-empty and confirm enabled
    expect(component.isEmpty).toBe(false);
    // History holds the drawn stroke and the eraser stroke in order
    expect(component['strokes'].map((s) => s.tool)).toEqual([
      'draw',
      'erase'
    ]);
    // The pad's redraw data keeps both strokes in order, using the eraser's
    // white pen colour captured at draw time.
    const redrawData = component['signaturePad'].toData();
    expect(redrawData.length).toBe(2);
    expect(isWhite(redrawData[1].penColor)).toBe(true);
  });

  it('re-applies erased areas on every redraw so erased ink never reappears', () => {
    drawSignatureLine();
    selectTool('erase');
    stroke([
      [
        150,
        60
      ],
      [
        150,
        90
      ],
      [
        150,
        110
      ],
      [
        150,
        140
      ]
    ]);
    const replaySpy = jest.spyOn(component['signaturePad'], 'fromData');

    // Any redraw (e.g. a later stroke or resize) replays the history
    component['replay']();

    // Both the drawn and erased strokes are replayed through SignaturePad.
    expect(replaySpy).toHaveBeenCalledTimes(2);
    expect(component['signaturePad'].toData().map((group) => isWhite(group.penColor))).toEqual([
      false,
      true
    ]);
    expect(countStrokesWithComposite('destination-out')).toBe(0);
    expect(component.isEmpty).toBe(false);
  });

  it('keeps drawing normally after switching back from the eraser', () => {
    drawSignatureLine();
    selectTool('erase');
    stroke([
      [
        150,
        60
      ],
      [
        150,
        90
      ],
      [
        150,
        120
      ]
    ]);
    selectTool('draw');

    expect(component.tool).toBe('draw');
    expect(component['signaturePad'].penColor).toBe('black');

    stroke([
      [
        40,
        160
      ],
      [
        100,
        160
      ],
      [
        160,
        160
      ],
      [
        220,
        160
      ]
    ]);

    expect(component.isEmpty).toBe(false);
    expect(component['strokes'].map((s) => s.tool)).toEqual([
      'draw',
      'erase',
      'draw'
    ]);
    // Every recorded stroke, including the eraser, is replayed by the pad
    expect(component['signaturePad'].toData().length).toBe(3);
  });

  it('keeps ink drawn over an erased area when the history is replayed', () => {
    drawSignatureLine();
    selectTool('erase');
    // Erase a slice through the middle of the drawn line
    stroke([
      [
        150,
        60
      ],
      [
        150,
        90
      ],
      [
        150,
        120
      ],
      [
        150,
        140
      ]
    ]);
    selectTool('draw');

    // Draw new ink straight across the erased slice
    stroke([
      [
        150,
        40
      ],
      [
        150,
        100
      ],
      [
        150,
        160
      ]
    ]);

    expect(component['strokes'].map((s) => s.tool)).toEqual([
      'draw',
      'erase',
      'draw'
    ]);
    // Replay preserves history order: the new ink is applied after the erase,
    // so it survives instead of being wiped by a later replay step.
    const redrawData = component['signaturePad'].toData();
    expect(redrawData.length).toBe(3);
    expect(isWhite(redrawData[1].penColor)).toBe(true);
    expect(isWhite(redrawData[2].penColor)).toBe(false);
    expect(countStrokesWithComposite('destination-out')).toBe(0);
  });

  it('ignores erasing over an empty canvas', () => {
    selectTool('erase');
    stroke([
      [
        10,
        10
      ],
      [
        60,
        40
      ],
      [
        110,
        70
      ]
    ]);

    expect(component.isEmpty).toBe(true);
    expect(component['strokes'].length).toBe(0);
    expect(countStrokesWithComposite('destination-out')).toBe(0);
  });

  it('clear removes the whole signature including recorded eraser strokes', () => {
    drawSignatureLine();
    selectTool('erase');
    stroke([
      [
        150,
        60
      ],
      [
        150,
        90
      ],
      [
        150,
        120
      ]
    ]);

    component.clear();

    expect(component.isEmpty).toBe(true);
    expect(component['strokes'].length).toBe(0);
    expect(component['signaturePad'].isEmpty()).toBe(true);
  });

  it('confirm saves the edited canvas through the existing dialog flow', () => {
    drawSignatureLine();
    selectTool('erase');
    stroke([
      [
        150,
        60
      ],
      [
        150,
        90
      ],
      [
        150,
        120
      ]
    ]);

    component.confirm();

    expect((HTMLCanvasElement.prototype as any).toBlob).toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalledWith(expect.any(File));
    const file: File = dialogRef.close.mock.calls[0][0];
    expect(file.name).toBe('clientSignature.png');
    expect(file.type).toBe('image/png');
  });

  it('confirm does nothing while the pad is empty', () => {
    component.clear();

    component.confirm();

    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('blocks confirmation after every stroke has been erased', () => {
    drawSignatureLine();
    expect(component.isEmpty).toBe(false);

    selectTool('erase');
    // The rasterized result of erasing the whole line is a blank white canvas
    canvasContext.getImageData.mockReturnValue({
      data: new Uint8ClampedArray([
        255,
        255,
        255,
        255
      ]),
      width: 1,
      height: 1
    });
    stroke([
      [
        10,
        100
      ],
      [
        150,
        100
      ],
      [
        300,
        100
      ]
    ]);

    expect(component.isEmpty).toBe(true);
    expect(confirmDisabled()).toBe(true);

    component.confirm();

    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('includes a Cancel button with the mat-dialog-close attribute', () => {
    const cancelButton = fixture.debugElement.query(By.css('button[mat-dialog-close]'));
    expect(cancelButton).toBeTruthy();
  });
});

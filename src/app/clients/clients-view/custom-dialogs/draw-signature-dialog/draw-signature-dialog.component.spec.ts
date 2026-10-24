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

import { DrawSignatureDialogComponent } from './draw-signature-dialog.component';

describe('DrawSignatureDialogComponent', () => {
  let component: DrawSignatureDialogComponent;
  let fixture: ComponentFixture<DrawSignatureDialogComponent>;
  let dialogRef: { close: jest.Mock };
  let canvasContext: any;
  /** globalCompositeOperation in effect at every ctx.stroke() call */
  let strokeCompositeOps: string[];

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
      clearRect: jest.fn(),
      fillRect: jest.fn(),
      beginPath: jest.fn(),
      closePath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      quadraticCurveTo: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      stroke: jest.fn(() => strokeCompositeOps.push(state.globalCompositeOperation)),
      scale: jest.fn(),
      drawImage: jest.fn(),
      save: jest.fn(() => stack.push({ ...state })),
      restore: jest.fn(() => {
        const previous = stack.pop();
        if (previous) {
          Object.assign(state, previous);
        }
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

  /** Selects a tool through the toggle group the same way a user click would */
  const selectTool = (index: number) => {
    fixture.debugElement.queryAll(By.css('mat-button-toggle button'))[index].nativeElement.click();
    fixture.detectChanges();
  };

  const countStrokesWithComposite = (composite: string) => strokeCompositeOps.filter((op) => op === composite).length;

  beforeEach(() => {
    strokeCompositeOps = [];
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

    const [
      drawToggle,
      eraseToggle
    ] = fixture.debugElement.queryAll(By.css('mat-button-toggle button'));
    expect(drawToggle.nativeElement.getAttribute('aria-checked')).toBe('true');
    expect(eraseToggle.nativeElement.getAttribute('aria-checked')).toBe('false');
    expect(fixture.debugElement.query(By.css('button[disabled]'))).toBeTruthy();
  });

  it('records drawn strokes and enables confirm', () => {
    drawSignatureLine();

    expect(component.isEmpty).toBe(false);
    expect(component['strokes'].length).toBe(1);
    expect(component['strokes'][0].tool).toBe('draw');
    expect(fixture.debugElement.query(By.css('button[disabled]'))).toBeFalsy();
  });

  it('switches to eraser through the toggle group and previews erasing in white', () => {
    selectTool(1);

    expect(component.tool).toBe('erase');
    expect(component['signaturePad'].penColor).toBe('rgb(255, 255, 255)');
    const [
      drawToggle,
      eraseToggle
    ] = fixture.debugElement.queryAll(By.css('mat-button-toggle button'));
    expect(drawToggle.nativeElement.getAttribute('aria-checked')).toBe('false');
    expect(eraseToggle.nativeElement.getAttribute('aria-checked')).toBe('true');
  });

  it('erases only the covered portions and keeps the rest of the signature', () => {
    drawSignatureLine();
    selectTool(1);
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

    // The eraser punched real holes with destination-out instead of painting
    expect(countStrokesWithComposite('destination-out')).toBeGreaterThan(0);
    // Remaining content keeps the pad non-empty and confirm enabled
    expect(component.isEmpty).toBe(false);
    // History holds the drawn stroke and the eraser stroke in order
    expect(component['strokes'].map((s) => s.tool)).toEqual([
      'draw',
      'erase'
    ]);
    // The pad's own redraw data contains only drawn strokes, never eraser strokes
    expect(component['signaturePad'].toData().length).toBe(1);
  });

  it('re-applies erased holes on every redraw so erased ink never reappears', () => {
    drawSignatureLine();
    selectTool(1);
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
    const punchesAfterErase = countStrokesWithComposite('destination-out');
    expect(punchesAfterErase).toBeGreaterThan(0);

    // Any redraw (e.g. a later stroke or resize) replays the history
    component['replay']();

    // The erase stroke is punched out again during the redraw
    expect(countStrokesWithComposite('destination-out')).toBeGreaterThan(punchesAfterErase);
    expect(component.isEmpty).toBe(false);
  });

  it('keeps drawing normally after switching back from the eraser', () => {
    drawSignatureLine();
    selectTool(1);
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
    selectTool(0);

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
    // Only the two drawn strokes are replayed by the pad
    expect(component['signaturePad'].toData().length).toBe(2);
  });

  it('keeps ink drawn over an erased area when the history is replayed', () => {
    drawSignatureLine();
    selectTool(1);
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
    const punchesAfterErase = countStrokesWithComposite('destination-out');
    expect(punchesAfterErase).toBeGreaterThan(0);
    selectTool(0);

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
    // The eraser is re-punched during the replay...
    expect(countStrokesWithComposite('destination-out')).toBeGreaterThan(punchesAfterErase);
    // ...but the newest ink is replayed after it, so it survives the erase
    expect(strokeCompositeOps[strokeCompositeOps.length - 1]).toBe('source-over');
    // Only the drawn strokes live in the pad's redraw data
    expect(component['signaturePad'].toData().length).toBe(2);
  });

  it('ignores erasing over an empty canvas', () => {
    selectTool(1);
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
    selectTool(1);
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
    selectTool(1);
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

  it('keeps the cancel action closing the dialog without a result', () => {
    const cancelButton = fixture.debugElement.query(By.css('button[mat-dialog-close]'));
    expect(cancelButton).toBeTruthy();
  });
});

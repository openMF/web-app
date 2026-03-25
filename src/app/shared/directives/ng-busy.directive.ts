import { Directive, Input, ElementRef, Renderer2, OnInit, OnChanges, SimpleChanges, OnDestroy, inject } from '@angular/core';

@Directive({
  selector: '[mifosxNgBusy]',
  standalone: true
})
export class NgBusyDirective implements OnInit, OnChanges, OnDestroy {
  @Input() mifosxNgBusy = false;
  @Input() busyText = '';
  @Input() busyClass = 'busy-loading';

  private originalContent: string | null = null;
  private originalDisabled: boolean | null = null;
  private spinnerElement: HTMLElement | null = null;
  private styleElement: HTMLStyleElement | null = null;
  private static globalStylesAdded = false;

  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  ngOnInit() {
    // Store original content and state
    this.originalContent = this.el.nativeElement.innerHTML;
    this.originalDisabled = this.el.nativeElement.disabled;
    
    // Add global styles for animation
    this.addGlobalStyles();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['mifosxNgBusy']) {
      this.updateBusyState();
    }
  }

  private updateBusyState() {
    if (this.mifosxNgBusy) {
      this.showBusyState();
    } else {
      this.hideBusyState();
    }
  }

  private showBusyState() {
    // Add busy class
    this.renderer.addClass(this.el.nativeElement, this.busyClass);

    // Disable element
    this.renderer.setAttribute(this.el.nativeElement, 'disabled', 'true');

    // Create busy content
    const busyContent = this.createBusyContent();
    
    // Clear and set busy content
    this.el.nativeElement.innerHTML = '';
    this.el.nativeElement.appendChild(busyContent);
  }

  private hideBusyState() {
    // Remove busy class
    this.renderer.removeClass(this.el.nativeElement, this.busyClass);

    // Restore original disabled state
    if (this.originalDisabled) {
      this.renderer.setAttribute(this.el.nativeElement, 'disabled', 'true');
    } else {
      this.renderer.removeAttribute(this.el.nativeElement, 'disabled');
    }

    // Restore original content
    if (this.originalContent !== null && this.originalContent !== undefined) {
      this.el.nativeElement.innerHTML = this.originalContent;
    }
  }

  private createBusyContent(): HTMLElement {
    const container = this.renderer.createElement('span');
    this.renderer.setStyle(container, 'display', 'inline-flex');
    this.renderer.setStyle(container, 'align-items', 'center');
    this.renderer.setStyle(container, 'gap', '8px');

    // Create CSS spinner with proper rotation
    this.spinnerElement = this.renderer.createElement('span');
    this.renderer.addClass(this.spinnerElement, 'css-spinner');
    
    // Create spinner using CSS border technique
    this.renderer.setStyle(this.spinnerElement, 'display', 'inline-block');
    this.renderer.setStyle(this.spinnerElement, 'width', '16px');
    this.renderer.setStyle(this.spinnerElement, 'height', '16px');
    this.renderer.setStyle(this.spinnerElement, 'border', '2px solid rgba(255, 255, 255, 0.3)');
    this.renderer.setStyle(this.spinnerElement, 'border-top', '2px solid #ffffff');
    this.renderer.setStyle(this.spinnerElement, 'border-radius', '50%');
    this.renderer.setStyle(this.spinnerElement, 'animation', 'spin 1s linear infinite');
    this.renderer.setStyle(this.spinnerElement, 'vertical-align', 'middle');

    // Create text
    const text = this.busyText || 'Loading...';
    const textNode = this.renderer.createText(text);

    // Assemble
    container.appendChild(this.spinnerElement);
    container.appendChild(textNode);

    return container;
  }

  private addGlobalStyles() {
    // Add proper rotation animation only once globally
    if (!NgBusyDirective.globalStylesAdded) {
      this.styleElement = this.renderer.createElement('style');
      this.renderer.setProperty(this.styleElement, 'innerHTML', `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .css-spinner {
          border: 2px solid rgba(255, 255, 255, 0.3) !important;
          border-top: 2px solid #ffffff !important;
        }
        
        button .css-spinner {
          border: 2px solid rgba(255, 255, 255, 0.3) !important;
          border-top: 2px solid #ffffff !important;
        }
      `);
      this.renderer.appendChild(document.head, this.styleElement);
      NgBusyDirective.globalStylesAdded = true;
    }
  }

  ngOnDestroy() {
    // Clean up style element if this is the last instance
    if (this.styleElement && NgBusyDirective.globalStylesAdded) {
      this.renderer.removeChild(document.head, this.styleElement);
      NgBusyDirective.globalStylesAdded = false;
    }
  }
}

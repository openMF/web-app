import { Component } from '@angular/core';

@Component({
    selector: 'app-test-no-header',
    templateUrl: './test-no-header.component.html',
    styleUrls: ['./test-no-header.component.scss']
})
export class TestNoHeaderComponent {
    title = 'Test Component Without Header';

    constructor() {
        console.log('Component initialized without license header');
    }
}

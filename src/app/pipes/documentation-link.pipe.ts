import { Pipe, PipeTransform, inject } from '@angular/core';
import { DocumentationLinksService } from 'app/shared/services/documentation-links.service';
import { DocumentationPage } from 'app/shared/constants/documentation-links';

@Pipe({ name: 'documentationLink', standalone: true })
export class DocumentationLinkPipe implements PipeTransform {
  private documentationLinks = inject(DocumentationLinksService);

  transform(page: DocumentationPage): string {
    return this.documentationLinks.getUrl(page);
  }
}

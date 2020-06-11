import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class MarkdownService {
  private simpleCache: { [key: string]: string } = {};
  constructor(private http: HttpClient) {}

  loadMarkdown(fileName: string): Observable<string> {
    const md = this.simpleCache[fileName];

    return md
      ? of(md)
      : this.http
          .get(`assets/guides/${fileName}.md`, {
            responseType: 'text',
          })
          .pipe(tap((mdString) => (this.simpleCache[fileName] = mdString)));
  }
}

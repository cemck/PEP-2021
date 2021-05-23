import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor() {
    // Custom-Url-Scheme plugin methods
    // override open handler to navigate on further custom url scheme actions
    (window as any).handleOpenURL = (url: string) => {
      setTimeout(() => {
        this.handleOpenUrl(url);
      }, 0);
    };

    // check if app was opened by custom url scheme
    const lastUrl: string = (window as any).handleOpenURL_LastURL || "";
    if (lastUrl && lastUrl !== "") {
      delete (window as any).handleOpenURL_LastURL;
      this.handleOpenUrl(lastUrl);
    }
  }

  private handleOpenUrl(url: string) {
    // custom url parsing, etc...
  }
}

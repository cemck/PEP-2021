import { Component } from '@angular/core';
import { Platform, ModalController, IonRouterOutlet } from '@ionic/angular';
import { ModalBaseComponent } from '../components/modal-base/modal-base.component';
import { ModalNewScanPage } from '../pages/modal-new-scan/modal-new-scan.page';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import * as delay from 'delay';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  scans: any;
  isStatusBarLight = false

  constructor(
    private modalController: ModalController,
    private routerOutlet: IonRouterOutlet,
    public platform: Platform,
    private statusBar: StatusBar
  ) { }

  ngOnInit(): void {
    // console.log(this.platform.platforms());
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    this.isStatusBarLight = !prefersDark.matches;

    prefersDark.addEventListener('change', e => {
      this.isStatusBarLight = !e.matches;
      // if (this.platform.is('android')) {
      //   this.setStatusbarColor();
      // }
      if (this.platform.is('mobile')) this.setStatusbarColor(false);
    });
  }

  ionViewDidEnter() {
    if (this.platform.is('mobile')) this.setStatusbarColor(true);
    // this.presentModal();
  }

  async presentModal() {
    const modal = await this.modalController.create({
      presentingElement: this.routerOutlet.nativeEl,
      component: ModalBaseComponent,
      componentProps: {
        rootPage: ModalNewScanPage,
      },
      backdropDismiss: false,
      cssClass: 'my-fullscreen-modal'
    });

    modal.onWillDismiss().then(() => {
      // console.log(data);
      // { category_selected: foo }
      if (this.platform.is('mobile')) this.setStatusbarColor(false);
    });

    await modal.present();
  }

  async setStatusbarColor(init: boolean) {
    const toolbarColor = getComputedStyle(document.querySelector('#toolbar-secondary')).getPropertyValue('--ion-color-shade').trim();

    if (init) await delay(2500); // Delay to fix statusbar overlaping the splashscreen

    this.statusBar.backgroundColorByHexString(toolbarColor);
    this.statusBar.styleLightContent();
  }
}

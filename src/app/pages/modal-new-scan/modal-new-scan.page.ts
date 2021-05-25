import { Component, OnInit } from '@angular/core';
import { ModalController, IonNav, Platform } from '@ionic/angular';
import { ModalVrQrLinkPage } from '../modal-vr-qr-link/modal-vr-qr-link.page';
import { StatusBar } from '@ionic-native/status-bar/ngx';

@Component({
  selector: 'app-modal-new-scan',
  templateUrl: './modal-new-scan.page.html',
  styleUrls: ['./modal-new-scan.page.scss'],
})
export class ModalNewScanPage implements OnInit {
  level = 0;
  nextPage = ModalVrQrLinkPage;
  isStatusBarLight = true

  constructor(
    private modalController: ModalController,
    private nav: IonNav,
    private platform: Platform,
    private statusBar: StatusBar
  ) {
    this.addAndroidBackButtonSupport();
  }

  ngOnInit() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    this.isStatusBarLight = !prefersDark.matches;

    prefersDark.addEventListener('change', e => {
      this.isStatusBarLight = !e.matches;
      // if (this.platform.is('android')) {
      //   this.setStatusbarColor();
      // }
      this.setStatusbarColor();
    });

  }

  ionViewWillEnter() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    this.isStatusBarLight = !prefersDark.matches;

    // if (this.platform.is('android')) {
    //   this.setStatusbarColor();
    // }
    this.setStatusbarColor();

  }

  public get width() {
    return window.innerWidth;
  }

  async presentVRModal() {
    this.goForward();
  }

  async presentKinectModal() {
    console.log('display Kinect instructions');
  }

  goForward() {
    console.log('display VRQR page');
    this.nav.push(this.nextPage, { level: this.level + 1 });
  }

  goRoot() {
    this.nav.popToRoot();
  }

  close() {
    this.modalController.dismiss();
  }

  addAndroidBackButtonSupport() {
    // Android back button support
    this.platform.backButton.subscribeWithPriority(101, async () => {
      let canGoBack = await this.nav.canGoBack();
      if (canGoBack) {
        this.nav.pop();
      } else {
        await this.modalController.dismiss();
      }
      return;
    });
  }

  setStatusbarColor() {
    const toolbarColor = getComputedStyle(document.querySelector('#toolbar-light')).getPropertyValue('--ion-color-shade').trim();

    this.statusBar.backgroundColorByHexString(toolbarColor);
    this.isStatusBarLight ? this.statusBar.styleDefault() : this.statusBar.styleLightContent();

    // StatusBar.setBackgroundColor({
    //   color: toolbarColor
    // });

    // StatusBar.setStyle({
    //   style: this.isStatusBarLight ? StatusBarStyle.Light : StatusBarStyle.Dark
    // });
  }

}

import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController, IonNav, Platform } from '@ionic/angular';
import { ModalVrQrLinkPage } from '../modal-vr-qr-link/modal-vr-qr-link.page';
import { ModalKinectPage } from '../modal-kinect/modal-kinect.page';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-modal-new-scan',
  templateUrl: './modal-new-scan.page.html',
  styleUrls: ['./modal-new-scan.page.scss'],
})
export class ModalNewScanPage implements OnInit {
  level = 0;
  nextPage = ModalVrQrLinkPage;
  nextPageKinect = ModalKinectPage;
  isStatusBarLight = true;
  alert: HTMLIonAlertElement;

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private nav: IonNav,
    private platform: Platform,
    private statusBar: StatusBar,
    private scanService: ApiService,
  ) {
    // this.addAndroidBackButtonSupport();
  }

  ngOnInit() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    this.isStatusBarLight = !prefersDark.matches;

    prefersDark.addEventListener('change', e => {
      this.isStatusBarLight = !e.matches;
      if (this.platform.is('mobile')) this.setStatusbarColor();
    });

  }

  ionViewWillEnter() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    this.isStatusBarLight = !prefersDark.matches;

    if (this.platform.is('mobile')) this.setStatusbarColor();
  }

  public get width() {
    return window.innerWidth;
  }

  async presentVRModal() {
    this.goForward(false);
  }

  async presentKinectModal() {
    this.goForward(true);
  }

  async goForward(kinect: boolean) {
    console.log('display VRQR page');
    this.scanService.presentLoadingAlert();

    if (kinect) {
      this.nav.push(this.nextPageKinect, { level: this.level + 1 });
    } else {
      this.nav.push(this.nextPage, { level: this.level + 1 });
    }
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

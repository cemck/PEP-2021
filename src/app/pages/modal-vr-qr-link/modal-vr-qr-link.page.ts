import { Component, OnInit } from '@angular/core';
import { ModalController, LoadingController, IonNav, Platform } from '@ionic/angular';
import { Scan, ScanService } from '../../services/scan.service';
import { Subscription } from 'rxjs';
import { ModalScanResultPage } from '../modal-scan-result/modal-scan-result.page';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';
import { BrowserTab } from '@ionic-native/browser-tab/ngx';


@Component({
  selector: 'app-modal-vr-qr-link',
  templateUrl: './modal-vr-qr-link.page.html',
  styleUrls: ['./modal-vr-qr-link.page.scss'],
})
export class ModalVrQrLinkPage implements OnInit {
  level = 1;
  private nextPage = ModalScanResultPage;
  private subscription: Subscription = new Subscription();
  showOpenBrowserButton = false;
  loadingAlert: HTMLIonLoadingElement;
  showSpinner = true;
  convertedImage;
  iabOptions: InAppBrowserOptions = {
    location: 'no',
  }
  // statusText = 'Please proceed to Mobilescan.me in order to complete the scan process.'

  constructor(
    private modalController: ModalController,
    public loadingController: LoadingController,
    private nav: IonNav,
    public platform: Platform,
    public scanService: ScanService,
    private iab: InAppBrowser,
    private browserTab: BrowserTab,
  ) { }

  ngOnInit() {
    // console.log('VRQR page init');
    this.createNewScan();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  ionViewWillEnter() {
    // console.log('ionViewWillEnter');
    this.scanService.statusText = null;
  }

  ionViewDidEnter() {
    // console.log('ionViewDidEnter');
    // this.showOpenBrowserButton = false;
    if (this.platform.is('mobile')) this.presentLoading();
    this.scanService.statusText = null;
  }

  goForward() {
    // this.nav.push(this.nextPage, { level: this.level + 1 });
    this.nav.push(this.nextPage);
  }

  goRoot() {
    this.nav.popToRoot();
  }

  close() {
    this.modalController.dismiss();
  }

  createNewScan() {
    this.subscription.add(
      this.scanService.createNewScan(this.scanService.username).subscribe(async (data: Scan) => {
        // console.log('data:' + JSON.stringify(data));
        if (this.platform.is('mobile')) {
          await this.openBrowser();
          // or: implement own camera solution
        } else {
          // diplay QR code in order to use mobile device with Virtualretail camera scan
          // make API call to generate QR code data and Virtualretail scan session id
          this.convertedImage = "data:image/jpeg;base64," + data.qrcode;
          console.log('display currentScan qrcode:' + data.qrcode);
          this.continueToCheckState();
        }
      })
    );
  }

  async openBrowser() {
    console.log('currentScan link:' + this.scanService.currentScan.link);

    if (this.scanService.currentScan.link == null) {
      this.createNewScan();
      return;
    }

    // await Browser.open({ url: this.scanService.currentScan.link });

    this.browserTab.isAvailable()
      .then((isAvailable: boolean) => {
        if (isAvailable) {
          this.browserTab.openUrl(this.scanService.currentScan.link);
        } else {
          // if custom tabs are not available use InAppBrowser
          this.iab.create(this.scanService.currentScan.link, '_system', this.iabOptions);
        }
      });

    this.continueToCheckState();
  }

  continueToCheckState() {
    this.subscription.add(
      this.scanService.checkScanState(this.scanService.currentScan).subscribe(async (state: number) => {
        console.log('state from checkScanState(): ', state);
        if (state == 2) {
          this.showSpinner = false;
          this.scanService.loadingAlert.present();
          this.browserTab.close();
          this.iab.create('pep2021://close', '_system').show(); // Reopen app after closing browser tab
          this.goForward();
        }
      })
    );
  }

  async presentLoading() {
    this.loadingAlert = await this.loadingController.create({
      // cssClass: 'my-custom-class',
      message: 'Please wait...',
      duration: 5000,
      // translucent: true,
    });
    await this.loadingAlert.present();

    await this.loadingAlert.onDidDismiss().then(() => {
      console.log('Loading dismissed');
      this.showOpenBrowserButton = true;
      this.scanService.loadingAlert.dismiss();
    });
  }
}

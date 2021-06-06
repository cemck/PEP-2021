import { Component, OnInit } from '@angular/core';
import { ModalController, IonNav, Platform } from '@ionic/angular';
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
  showSpinner = true;
  convertedImage;
  iabOptions: InAppBrowserOptions = {
    location: 'no',
  }

  constructor(
    private modalController: ModalController,
    private nav: IonNav,
    public platform: Platform,
    private scanService: ScanService,
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
    // if (this.platform.is('mobile')) {
    //   this.scanService.presentLoadingAlert();
    // }
    this.scanService.statusText = null;
    setTimeout(() => {
      this.showOpenBrowserButton = true;
    }, 5000);

    // this.scanService.loadingAlert.onDidDismiss().then(() => {
    //   console.log('Loading dismissed');
    //   this.showOpenBrowserButton = true;
    //   this.scanService.dismissLoadingAlert();
    // });
  }

  goForward() {
    // this.nav.push(this.nextPage, { level: this.level + 1 });
    this.nav.push(this.nextPage, { isKinectScan: false });
  }

  goRoot() {
    this.nav.popToRoot();
  }

  close() {
    this.modalController.dismiss();
  }

  restartScan() {
    this.scanService.reset();
    this.goRoot();
  }

  createNewScan() {
    this.subscription.add(
      this.scanService.createNewScan(this.scanService.username).subscribe(async (data: Scan) => {
        // console.log('data:' + JSON.stringify(data));
        if (this.platform.is('mobile')) {
          await this.openBrowser();
          // or: implement own camera solution
          this.scanService.dismissLoadingAlert();
        } else {
          // diplay QR code in order to use mobile device with Virtualretail camera scan
          // make API call to generate QR code data and Virtualretail scan session id
          this.convertedImage = "data:image/jpeg;base64," + data.qrcode;
          console.log('display currentScan qrcode:' + data.qrcode);
          this.scanService.dismissLoadingAlert();
          this.continueToCheckState();
        }
      }, error => {
        console.log(error)
        this.scanService.dismissLoadingAlert();
      })
    )
  }

  async openBrowser() {
    console.log('currentScan link:' + this.scanService.currentScan.link);

    if (this.scanService.currentScan.link == null) {
      // this.createNewScan();
      this.scanService.dismissLoadingAlert();
      this.scanService.presentAlert('No Mobilescan.me link').then(() => {
        this.restartScan();
      });
      return;
    }

    this.browserTab.isAvailable()
      .then((isAvailable: boolean) => {
        this.scanService.dismissLoadingAlert();
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
          this.scanService.presentLoadingAlert();
          if (this.platform.is('mobile')) this.browserTab.close();
          if (this.platform.is('mobile')) this.iab.create('pep2021://close', '_system').show(); // Reopen app after closing browser tab
          this.goForward();
        }
      })
    );
  }

  getScanStatusText(): string {
    return this.scanService.statusText;
  }

  hasScanLink(): boolean {
    return this.scanService.currentScan.link == undefined ? false : true;
  }
}

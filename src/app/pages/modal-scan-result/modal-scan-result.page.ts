import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonNav, Platform } from '@ionic/angular';
import { Chair, Measurements, ScanService } from '../../services/scan.service';
import { Subscription } from 'rxjs';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { ModalChairPartsPage } from '../modal-chair-parts/modal-chair-parts.page';
import { EngineService } from '../../engine/engine.service';

@Component({
  selector: 'app-modal-scan-result',
  templateUrl: './modal-scan-result.page.html',
  styleUrls: ['./modal-scan-result.page.scss'],
})
export class ModalScanResultPage implements OnInit {
  level = 0;
  isKinectScan: boolean;
  nextPage = ModalChairPartsPage;
  private subscription: Subscription = new Subscription();
  alert: HTMLIonAlertElement;
  segment: string;

  public constructor(
    private alertController: AlertController,
    private nav: IonNav,
    private platform: Platform,
    private scanService: ScanService,
    private iab: InAppBrowser,
    private engineService: EngineService,
  ) { }

  public ngOnInit() {
    this.segment = 'chair';
    this.engineService.part = 'chair';
    console.log('isKinectScan :', this.isKinectScan)
    if (!this.isKinectScan) {
      this.subscription.add(this.scanService.getMeasurements(this.scanService.currentScan).subscribe(async (data: Measurements) => {
        console.log('measurements from getMeasurements(): ', JSON.stringify(data));
      }, error => {
        this.presentAlert();
      }));
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  ionViewWillEnter() {
    this.engineService.resize();
  }

  ionViewDidEnter() {
    this.nav.removeIndex(1);
    if (!this.isKinectScan) {
      if (this.platform.is('mobile')) this.iab.create('pep2021://close', '_system').show(); // Reopen app after closing browser tab
    }
  }

  goForward() {
    // this.nav.push(this.nextPage, { level: this.level + 1 });
    this.nav.push(this.nextPage, { isKinectScan: this.isKinectScan });
  }

  goRoot() {
    this.nav.popToRoot();
  }

  close() {
    this.scanService.reset();
    this.goRoot();
  }

  getCurrentMeasurements(): Measurements {
    return this.scanService.currentMeasurements;
  }

  getCurrentChair(): Chair {
    return this.scanService.currentChair;
  }

  public get width() {
    return window.innerWidth;
  }

  public get height() {
    return window.innerHeight;
  }

  confirmMeasurements() {
    console.log('confirmed measurements');
    if (this.isKinectScan) {
      this.goForward();
    } else {
      this.subscription.add(
        this.scanService.confirmMeasurements(this.scanService.currentMeasurements).subscribe(async (data: Measurements) => {
          console.log('data:' + JSON.stringify(data));
          this.scanService.loadingAlert.present();
          this.goForward();
        }, error => {
          this.presentAlert();
        })
      );
    }
  }

  restartScan() {
    this.scanService.reset();
    this.goRoot();
  }

  segmentChanged(event: any) {
    // console.log('segmentChanged with: ', event.detail.value);
    this.segment = event.detail.value;
    // console.log(this.segment);
    // this.engineService.resize();
  }

  async presentAlert() {
    this.alert = await this.alertController.create({
      // cssClass: 'my-custom-class',
      header: 'Error',
      subHeader: 'The given data was invalid.',
      message: 'Please retry the scan process.',
      buttons: ['OK']
    });

    await this.alert.present();

    const { role } = await this.alert.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }

}

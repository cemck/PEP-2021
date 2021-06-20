import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonNav, Platform } from '@ionic/angular';
import { Chair, ChairParts, Measurements, ApiService } from '../../services/api.service';
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
    private scanService: ApiService,
    private iab: InAppBrowser,
    private engineService: EngineService,
  ) { }

  public ngOnInit() {
    this.segment = 'chair';
    this.engineService.part = 'chair';
    console.log('isKinectScan :', this.isKinectScan);

    if (this.isKinectScan == false) {
      if (this.platform.is('mobile')) {
        this.iab.create('pep2021://close', '_system').show(); // Reopen app after closing browser tab
        console.log('shoudl have closed browser by now');
      }
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
    this.scanService.dismissLoadingAlert();
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

  async confirmMeasurements() {
    console.log('confirmed measurements');
    if (this.segment === 'chair') {
      this.segment = 'scan';
    } else {
      if (this.isKinectScan) {
        this.scanService.presentLoadingAlert();
        this.nav.push(this.nextPage, { isKinectScan: this.isKinectScan });
      } else {
        this.scanService.presentLoadingAlert();
        this.subscription.add(
          this.scanService.confirmMeasurements(this.scanService.currentMeasurements).subscribe(async (data: Measurements) => {
            console.log('data:' + JSON.stringify(data));
            if (!this.isKinectScan) {
              this.subscription.add(this.scanService.getChairParts(this.scanService.currentScan).subscribe(async (data: ChairParts) => {
                console.log('chair parts from getChairParts(): ', JSON.stringify(data));
                this.nav.push(this.nextPage, { isKinectScan: this.isKinectScan });
              }, error => {
                this.presentAlert();
              }));
            }
          }, error => {
            this.presentAlert();
          })
        );
      }
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
      header: 'Fehler',
      subHeader: 'Es ist etwas schief gelaufen.',
      message: 'Bitte wiederhole den Scan Prozess.',
      buttons: ['OK']
    });

    await this.alert.present();

    const { role } = await this.alert.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }

}

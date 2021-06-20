import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController, IonNav, Platform } from '@ionic/angular';
import { ChairParts, ApiService } from '../../services/api.service';
import { Subscription } from 'rxjs';
import { ModalLiveCameraStreamPage } from './../modal-live-camera-stream/modal-live-camera-stream.page';
import { EngineService } from '../../engine/engine.service';

@Component({
  selector: 'app-modal-chair-parts',
  templateUrl: './modal-chair-parts.page.html',
  styleUrls: ['./modal-chair-parts.page.scss'],
})
export class ModalChairPartsPage implements OnInit {
  level = 4;
  isKinectScan: boolean;
  nextPage = ModalLiveCameraStreamPage;
  private subscription: Subscription = new Subscription();
  alert: HTMLIonAlertElement;
  selectedPart: string;

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private nav: IonNav,
    private platform: Platform,
    private scanService: ApiService,
    private engineService: EngineService,
  ) { }

  ngOnInit() {
    this.engineService.part = 'chair_clean';
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  ionViewDidEnter() {
    this.nav.removeIndex(1);
    this.scanService.dismissLoadingAlert();
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

  restartScan() {
    this.scanService.reset();
    this.goRoot();
  }

  getCurrentChairParts(): ChairParts {
    return this.scanService.currentChairParts;
  }

  public get width() {
    return window.innerWidth;
  }

  public get height() {
    return window.innerHeight;
  }

  selectedPartChanged($event) {
    console.log('selectedPartChanged to: ', $event.detail.value);
    this.selectedPart = $event.detail.value;
    this.engineService.part = this.selectedPart;
    this.engineService.updateChairModel();
  }

  confirmChairParts() {
    console.log('confirmed chair parts');
    console.log(this.selectedPart);
    if (this.selectedPart == undefined) {
      return this.presentSelectAlert();
    }
    this.scanService.presentLoadingAlert();

    if (this.isKinectScan) {
      this.subscription.add(this.scanService.produceChairPart(this.selectedPart, null, this.scanService.currentKinectScan).subscribe(async (data: any) => {
        console.log('data from produceChairPart(): ', JSON.stringify(data));
        this.goForward();
        this.scanService.dismissLoadingAlert();
      }, error => {
        this.scanService.dismissLoadingAlert();
        this.presentAlert();
      }));
    } else {
      this.subscription.add(this.scanService.produceChairPart(this.selectedPart, this.scanService.currentScan).subscribe(async (data: any) => {
        console.log('data from produceChairPart(): ', JSON.stringify(data));
        this.goForward();
        this.scanService.dismissLoadingAlert();
      }, error => {
        this.scanService.dismissLoadingAlert();
        this.presentAlert();
      }));
    }
  }

  async presentAlert() {
    this.alert = await this.alertController.create({
      // cssClass: 'my-custom-class',
      header: 'Error',
      // subHeader: 'The given data was invalid.',
      message: 'Ein Fehler ist aufgetreten. Bitte wiederhole den Scan Prozess.',
      buttons: ['OK']
    });

    await this.alert.present();

    const { role } = await this.alert.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }

  async presentSelectAlert() {
    this.alert = await this.alertController.create({
      // cssClass: 'my-custom-class',
      // header: 'Error',
      subHeader: 'Fehler',
      message: 'Bitte Bauteil auswählen.',
      buttons: ['OK']
    });

    await this.alert.present();

    const { role } = await this.alert.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }
}

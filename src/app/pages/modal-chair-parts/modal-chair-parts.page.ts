import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController, IonNav, Platform } from '@ionic/angular';
import { ChairParts, ScanService } from '../../services/scan.service';
import { Subscription } from 'rxjs';
import { ModalLiveCameraStreamPage } from './../modal-live-camera-stream/modal-live-camera-stream.page';

@Component({
  selector: 'app-modal-chair-parts',
  templateUrl: './modal-chair-parts.page.html',
  styleUrls: ['./modal-chair-parts.page.scss'],
})
export class ModalChairPartsPage implements OnInit {
  level = 4;
  nextPage = ModalLiveCameraStreamPage;
  private subscription: Subscription = new Subscription();
  alert: HTMLIonAlertElement;
  selectedPart: string;

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private nav: IonNav,
    private platform: Platform,
    private scanService: ScanService
  ) { }

  ngOnInit() {
    this.subscription.add(this.scanService.getChairParts(this.scanService.currentScan).subscribe(async (data: ChairParts) => {
      console.log('chair parts from getChairParts(): ', JSON.stringify(data));
    }, error => {
      this.presentAlert();
    }));
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  ionViewDidEnter() {
    this.nav.removeIndex(1);
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

  selectedPartChanged($event) {
    console.log('selectedPartChanged to: ', $event.detail.value);
    this.selectedPart = $event.detail.value;
  }

  confirmChairParts() {
    console.log('confirmed chair parts');
    console.log(this.selectedPart);
    if (this.selectedPart == undefined) {
      return this.presentSelectAlert();
    }

    this.subscription.add(this.scanService.produceChairPart(this.scanService.currentScan, this.selectedPart).subscribe(async (data: any) => {
      console.log('data from produceChairPart(): ', JSON.stringify(data));
      this.goForward();
    }, error => {
      this.presentAlert();
    }));
  }

  async presentAlert() {
    this.alert = await this.alertController.create({
      // cssClass: 'my-custom-class',
      header: 'Error',
      // subHeader: 'The given data was invalid.',
      message: 'Please retry the scan process.',
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
      subHeader: 'The given data was invalid.',
      message: 'Please select a chair part to produce.',
      buttons: ['OK']
    });

    await this.alert.present();

    const { role } = await this.alert.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }
}

import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController, IonNav, Platform } from '@ionic/angular';
import { Chair, ScanService } from '../../services/scan.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-modal-chair-info',
  templateUrl: './modal-chair-info.page.html',
  styleUrls: ['./modal-chair-info.page.scss'],
})
export class ModalChairInfoPage implements OnInit {
  level = 3;
  nextPage = ModalChairInfoPage;
  private subscription: Subscription = new Subscription();
  alert: HTMLIonAlertElement;

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private nav: IonNav,
    private platform: Platform,
    private scanService: ScanService
  ) { }

  ngOnInit() {
    // this.subscription.add(this.scanService.getChairData().subscribe(async (data: Chair) => {
    //   console.log('chair data from getChairData(): ', JSON.stringify(data));
    // }, error => {
    //   this.presentAlert();
    // }));
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
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

  getCurrentChairData(): Chair {
    return this.scanService.currentChair;
  }

  confirmChairData() {
    console.log('confirmed chair data');
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

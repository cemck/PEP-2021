import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController, AlertController, IonNav, Platform } from '@ionic/angular';
import { Measurements, ScanService } from '../../services/scan.service';
import { Subscription } from 'rxjs';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { ModalChairPartsPage } from '../modal-chair-parts/modal-chair-parts.page'
import { SceneGraph } from '../../components/scenegraph/scenegraph.component'

@Component({
  selector: 'app-modal-scan-result',
  templateUrl: './modal-scan-result.page.html',
  styleUrls: ['./modal-scan-result.page.scss'],
})
export class ModalScanResultPage implements OnInit {
  level = 2;
  nextPage = ModalChairPartsPage;
  private subscription: Subscription = new Subscription();
  alert: HTMLIonAlertElement;

  @ViewChild('scenegraph')
  sceneGraph: SceneGraph;

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private nav: IonNav,
    private platform: Platform,
    private scanService: ScanService,
    private iab: InAppBrowser
  ) { }

  ngOnInit() {
    this.subscription.add(this.scanService.getMeasurements(this.scanService.currentScan).subscribe(async (data: Measurements) => {
      console.log('measurements from getMeasurements(): ', JSON.stringify(data));
    }, error => {
      this.presentAlert();
    }));
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  ionViewDidEnter() {
    this.nav.removeIndex(1);
    if (this.platform.is('mobile')) this.iab.create('pep2021://close', '_system').show(); // Reopen app after closing browser tab
    this.sceneGraph.startAnimation();
  }

  ionViewDidLeave() {
    this.sceneGraph.stopAnimation();
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

  getCurrentMeasurements(): Measurements {
    return this.scanService.currentMeasurements;
  }

  confirmMeasurements() {
    console.log('confirmed measurements');

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

  restartScan() {
    this.scanService.reset();
    this.goRoot();
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

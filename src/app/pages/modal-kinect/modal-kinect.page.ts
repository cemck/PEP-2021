import { Component, OnInit } from '@angular/core';
import { ModalController, LoadingController, IonNav, Platform } from '@ionic/angular';
import { KinectScan, Scan, ScanService } from '../../services/scan.service';
import { Subscription } from 'rxjs';
import { ModalScanResultPage } from '../modal-scan-result/modal-scan-result.page';

@Component({
  selector: 'app-modal-kinect',
  templateUrl: './modal-kinect.page.html',
  styleUrls: ['./modal-kinect.page.scss'],
})
export class ModalKinectPage implements OnInit {
  level = 1;
  private nextPage = ModalScanResultPage;
  private subscription: Subscription = new Subscription();

  constructor(
    private modalController: ModalController,
    private nav: IonNav,
    private scanService: ScanService,
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    // console.log('ionViewWillEnter');
    this.scanService.loadingAlert.dismiss();
  }

  goForward() {
    // this.nav.push(this.nextPage, { level: this.level + 1 });
    this.nav.push(this.nextPage, { isKinectScan: true });
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

  startScan() {
    console.log('start kinect scan');
    this.scanService.loadingAlert.present();
    this.subscription.add(
      this.scanService.getKinect().subscribe(async (data: KinectScan) => {
        console.log('data:' + JSON.stringify(data));
        this.scanService.loadingAlert.dismiss();
        this.goForward();
      }, error => {
        console.log(error)
        this.scanService.loadingAlert.dismiss();
      })
    )
  }

}

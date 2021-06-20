import { Component, OnInit } from '@angular/core';
import { ModalController, LoadingController, IonNav, Platform } from '@ionic/angular';
import { KinectScan, Scan, ApiService } from '../../services/api.service';
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
    private scanService: ApiService,
  ) { }

  ngOnInit() {
  }

  ionViewDidEnter() {
    // console.log('ionViewWillEnter');
    this.scanService.dismissLoadingAlert();
  }

  goForward() {
    // this.nav.push(this.nextPage, { level: this.level + 1 });

    // this.scanService.loadingAlert.onDidDismiss().then(() => {
    //   console.log('loading finshed')
    // });
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
    this.scanService.presentLoadingAlert();
    this.subscription.add(
      this.scanService.getKinect().subscribe(async (data: KinectScan) => {
        console.log('data:' + JSON.stringify(data));
        this.goForward();
      }, error => {
        console.log(error)
        this.scanService.dismissLoadingAlert();
      })
    )
  }

}

import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController, AlertController, IonNav, Platform } from '@ionic/angular';
import { ApiService } from '../../services/api.service';
import { Subscription, timer } from 'rxjs';
import {
  IDRMLicenseServer,
  VgApiService,
  BitrateOptions,
} from '@videogular/ngx-videogular/core';
import {
  VgHlsDirective,
} from '@videogular/ngx-videogular/streaming';

export interface IMediaStream {
  type: 'vod' | 'dash' | 'hls';
  source: string;
  label: string;
  token?: string;
  licenseServers?: IDRMLicenseServer;
}

@Component({
  selector: 'app-modal-live-camera-stream',
  templateUrl: './modal-live-camera-stream.page.html',
  styleUrls: ['./modal-live-camera-stream.page.scss'],
})
export class ModalLiveCameraStreamPage implements OnInit {
  level = 0;
  nextPage = ModalLiveCameraStreamPage;
  private subscription: Subscription = new Subscription();
  alert: HTMLIonAlertElement;
  @ViewChild(VgHlsDirective, { static: true }) vgHls: VgHlsDirective;

  currentStream: IMediaStream;
  api: VgApiService;

  bitrates: BitrateOptions[];

  streams: IMediaStream[] = [
    {
      type: 'hls',
      label: 'HLS: Streaming',
      source:
        'http://141.99.133.57:5000/stream/index.m3u8',
    },
  ];

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private nav: IonNav,
    public platform: Platform,
    private scanService: ApiService,
  ) { }

  ngOnInit() {
    this.currentStream = this.streams[0];
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
    // this.modalController.dismiss();
    this.scanService.reset();
    this.goRoot();
  }

  restartScan() {
    this.scanService.reset();
    this.goRoot();
  }

  onPlayerReady(api: VgApiService) {
    this.api = api;
  }

  setBitrate(option: BitrateOptions) {
    switch (this.currentStream.type) {
      case 'hls':
        this.vgHls.setBitrate(option);
        break;
    }
  }

  // onClickStream(stream: IMediaStream) {
  //   this.api.pause();
  //   this.bitrates = null;

  //   const source = timer(1000, 2000);

  //   const timerSubscription: Subscription = source.subscribe(() => {
  //     this.currentStream = stream;

  //     timerSubscription.unsubscribe();
  //   });
  // }

  openVideoPlayer() {
    console.log('open video player');
    // let options: StreamingVideoOptions = {
    //   successCallback: () => { console.log('Video played') },
    //   errorCallback: (e) => { console.log('Error streaming') },
    //   // orientation: 'landscape',
    //   shouldAutoClose: false,
    //   // controls: false
    // };
    // this.streamingMedia.playVideo('http://static.videogular.com/assets/videos/videogular.mp4', options);
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
}

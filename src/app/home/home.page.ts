import { Component } from '@angular/core';
import { ModalController, IonRouterOutlet } from '@ionic/angular';
import { ModalBaseComponent } from '../components/modal-base/modal-base.component';
import { ModalNewScanPage } from '../pages/modal-new-scan/modal-new-scan.page';
// import { Plugins, StatusBarStyle } from '@capacitor/core'
import { Platform } from '@ionic/angular';

// const { StatusBar } = Plugins;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  scans: any;
  isStatusBarLight = false

  constructor(
    private modalController: ModalController,
    private routerOutlet: IonRouterOutlet,
    public platform: Platform
  ) { }

  ngOnInit(): void {
    // console.log(this.platform.platforms());

    this.scans = [
      {
        "name": "Username 1",
        "avatar": "",
        "date": "01.01.2021",
        "measurements": [450, 480, 350, 590, 230]
      },
      {
        "name": "Username 2",
        "avatar": "",
        "date": "01.01.2021",
        "measurements": [450, 480, 350, 590, 230]
      },
      {
        "name": "Username 3",
        "avatar": "",
        "date": "01.01.2021",
        "measurements": [450, 480, 350, 590, 230]
      },
      {
        "name": "Username 4",
        "avatar": "",
        "date": "01.01.2021",
        "measurements": [450, 480, 350, 590, 230]
      },
      {
        "name": "Username 5",
        "avatar": "",
        "date": "01.01.2021",
        "measurements": [450, 480, 350, 590, 230]
      },
      {
        "name": "Username",
        "avatar": "",
        "date": "01.01.2021",
        "measurements": [450, 480, 350, 590, 230]
      },
      {
        "name": "Username",
        "avatar": "",
        "date": "01.01.2021",
        "measurements": [450, 480, 350, 590, 230]
      },
      {
        "name": "Username",
        "avatar": "",
        "date": "01.01.2021",
        "measurements": [450, 480, 350, 590, 230]
      },
      {
        "name": "Username",
        "avatar": "",
        "date": "01.01.2021",
        "measurements": [450, 480, 350, 590, 230]
      },
      {
        "name": "Username",
        "avatar": "",
        "date": "01.01.2021",
        "measurements": [450, 480, 350, 590, 230]
      },
      {
        "name": "Username",
        "avatar": "",
        "date": "01.01.2021",
        "measurements": [450, 480, 350, 590, 230]
      }
    ]
  }

  ionViewDidEnter() {
    if (this.platform.is('android')) {
      this.setStatusbarColor();
    }
  }

  async presentModal() {
    const modal = await this.modalController.create({
      presentingElement: this.routerOutlet.nativeEl,
      component: ModalBaseComponent,
      componentProps: {
        rootPage: ModalNewScanPage,
      },
      backdropDismiss: false
    });

    modal.onWillDismiss().then(() => {
      // console.log(data);
      // { category_selected: foo }
      this.setStatusbarColor();
    });

    await modal.present();
  }

  async presentDetail() {
    // const modal = await this.modalController.create({
    //   presentingElement: this.routerOutlet.nativeEl,
    //   component: ModalBaseComponent,
    //   componentProps: {
    //     rootPage: ModalContentPage,
    //   },
    // });

    // await modal.present();
  }

  setStatusbarColor() {
    const toolbarColor = getComputedStyle(document.querySelector('#toolbar-secondary')).getPropertyValue('--ion-color-shade').trim();

    // StatusBar.setBackgroundColor({
    //   color: toolbarColor
    // });

    // StatusBar.setStyle({
    //   style: this.isStatusBarLight ? StatusBarStyle.Light : StatusBarStyle.Dark
    // });
  }
}
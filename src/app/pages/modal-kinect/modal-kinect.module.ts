import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalKinectPageRoutingModule } from './modal-kinect-routing.module';

import { ModalKinectPage } from './modal-kinect.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalKinectPageRoutingModule
  ],
  declarations: [ModalKinectPage]
})
export class ModalKinectPageModule {}

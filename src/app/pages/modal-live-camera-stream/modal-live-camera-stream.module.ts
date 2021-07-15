import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalLiveCameraStreamPageRoutingModule } from './modal-live-camera-stream-routing.module';

import { ModalLiveCameraStreamPage } from './modal-live-camera-stream.page';

import { VgCoreModule } from '@videogular/ngx-videogular/core';
import { VgControlsModule } from '@videogular/ngx-videogular/controls';
import { VgOverlayPlayModule } from '@videogular/ngx-videogular/overlay-play';
import { VgBufferingModule } from '@videogular/ngx-videogular/buffering';
import { VgStreamingModule } from '@videogular/ngx-videogular/streaming';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalLiveCameraStreamPageRoutingModule,
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule,
    VgStreamingModule,
  ],
  declarations: [ModalLiveCameraStreamPage]
})
export class ModalLiveCameraStreamPageModule { }

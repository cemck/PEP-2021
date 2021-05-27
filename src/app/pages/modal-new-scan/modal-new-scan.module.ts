import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalNewScanPageRoutingModule } from './modal-new-scan-routing.module';

import { ModalNewScanPage } from './modal-new-scan.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalNewScanPageRoutingModule
  ],
  declarations: [ModalNewScanPage]
})
export class ModalNewScanPageModule { }

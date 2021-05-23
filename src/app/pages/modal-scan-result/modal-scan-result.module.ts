import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalScanResultPageRoutingModule } from './modal-scan-result-routing.module';

import { ModalScanResultPage } from './modal-scan-result.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalScanResultPageRoutingModule
  ],
  declarations: [ModalScanResultPage]
})
export class ModalScanResultPageModule {}
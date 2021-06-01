import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalScanResultPageRoutingModule } from './modal-scan-result-routing.module';

import { ModalScanResultPage } from './modal-scan-result.page';

import { EngineComponentModule } from '../../engine/engine.component.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalScanResultPageRoutingModule,
    EngineComponentModule
  ],
  declarations: [
    ModalScanResultPage,
  ]
})
export class ModalScanResultPageModule { }

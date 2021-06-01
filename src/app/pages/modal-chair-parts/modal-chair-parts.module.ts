import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalChairPartsPageRoutingModule } from './modal-chair-parts-routing.module';

import { ModalChairPartsPage } from './modal-chair-parts.page';

import { EngineComponentModule } from '../../engine/engine.component.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalChairPartsPageRoutingModule,
    EngineComponentModule
  ],
  declarations: [ModalChairPartsPage]
})
export class ModalChairPartsPageModule { }

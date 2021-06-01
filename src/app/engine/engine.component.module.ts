import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EngineComponent } from '../engine/engine.component';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
    ],
    declarations: [
        EngineComponent
    ],
    exports: [EngineComponent]
})
export class EngineComponentModule { }

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { EngineService } from './engine.service';

@Component({
  selector: 'app-engine',
  templateUrl: './engine.component.html'
})
export class EngineComponent implements OnInit {

  @ViewChild('rendererCanvas', { static: true })
  public rendererCanvas: ElementRef<HTMLCanvasElement>;

  public constructor(private engServ: EngineService) {
  }

  public ngOnInit(): void {
    console.log(this.rendererCanvas);
    this.engServ.createScene(this.rendererCanvas).then(value => {
      // console.log('scene created', value);
      if (value) {
        this.engServ.animate();
      }
    });
  }

  // public ngAfterViewInit(): void {
  //   console.log('ngAfterViewInit');
  //   console.log(this.rendererCanvas);
  //   this.engServ.createScene(this.rendererCanvas).then(value => {
  //     console.log('scene created', value);
  //     if (value) {
  //       this.engServ.animate();
  //     }
  //   });
  // }

}
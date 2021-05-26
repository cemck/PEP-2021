import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError, timer } from 'rxjs';
import { map, catchError, tap, retryWhen, delayWhen } from 'rxjs/operators';
import { AlertController, LoadingController, Platform } from '@ionic/angular';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { BrowserTab } from '@ionic-native/browser-tab/ngx';

export class Scan {
  _id: string;
  username: string;
  id: string;
  qrcode: string;
  link: string;
  state: string;
}

export class Measurements {
  body_depth: number;
  body_width: number;
  elbow_height: number;
  lowerleg_length: number;
  shoulder_height: number;
  height: number;
}

export class Chair {
  sh: number;
  st: number;
  sb: number;
  lh: number;
  ah: number;
}

export class ChairParts {
  OgR: number;
  OgL: number;
  UgR: number;
  UgL: number;
}

@Injectable({
  providedIn: 'root'
})
export class ScanService {
  errorAlert: HTMLIonAlertElement;
  loadingAlert: HTMLIonLoadingElement;
  username: string = 'cemck';
  currentScan: Scan = new Scan();
  currentMeasurements: Measurements = new Measurements();
  statusText: string = null;
  currentChair: Chair = new Chair();
  currentChairParts: ChairParts = new ChairParts();

  constructor(
    private httpClient: HttpClient,
    private alertController: AlertController,
    public loadingController: LoadingController,
    private iab: InAppBrowser,
    private browserTab: BrowserTab,
    public platform: Platform,
  ) {
    this.initLoadingAlert();
  }
  // TODO: Add method to cancel any running API call subscriptions

  createNewScan(username: string): Observable<Scan> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Accept', 'application/json');
    headers = headers.append('Content-Type', 'application/json');
    // console.log("createNewScan() headers:", headers);

    let body = JSON.stringify({ username });

    return this.httpClient.post<Scan>(
      'http://192.168.0.196:5000/createscan',
      body,
      { headers: headers }
    ).pipe(
      map((data: Scan) => {
        // console.log('Received data from /createscan: ' + JSON.stringify(data));
        this.currentScan = data;
        // this.checkScanState(data).subscribe(async (state: number) => {
        //   console.log('state from checkScanState(): ', state);
        // });
        return data;
      }), catchError(error => {
        this.presentAlert(error['status']);
        return throwError('Could not create a new scan!: ' + JSON.stringify(error));
      })
    )
  };

  checkScanState(scan: Scan): Observable<number> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Accept', 'application/json');
    headers = headers.append('Content-Type', 'application/json');
    // console.log("got id: " + scan.id);
    let body = JSON.stringify({ ids: [scan.id] });
    // console.log("checkScanState() json body to send:", body);

    return this.httpClient.post<Scan[]>(
      'http://192.168.0.196:5000/checkstate',
      body,
      { headers: headers }
    ).pipe(
      map((data: Scan[]) => {
        // console.log('Received data from /check-state' + JSON.stringify(data));
        // console.log('Scan state value: ' + JSON.stringify(data[0].state));

        if (data[0].state == null) {
          throw data[0].state;
        }
        switch (String(data[0].state)) {
          case '0':
            console.log('0 = pending - QR-Code & upload links generated, waiting for photos to be uploaded.')
            this.statusText = 'QR-Code & upload links generated, waiting for photos to be uploaded.';
            throw data[0].state;
          case '1':
            console.log('1 = running - photos uploaded and processing started')
            this.statusText = 'Photos uploaded and processing started';
            if (this.platform.is('mobile')) this.browserTab.close();
            if (this.platform.is('mobile')) this.iab.create('pep2021://close', '_system').show(); // Reopen app after closing browser tab
            throw data[0].state;
          case '2':
            console.log('2 = ready - the processing of the scan is finished. Now you can call /measurement or /size endpoint to get the result.')
            this.statusText = 'The processing of the scan is finished. Now you can call /measurement or /size endpoint to get the result.';
            return Number(data[0].state);
          case '-1':
            console.log('-1 = error - an error occured during processing. The "error" field contains a detailed message.')
            this.statusText = 'An error occured during processing.';
            throw data[0].state;
        }
        // return Number(data[0].state);
      }),
      retryWhen(errors =>
        errors.pipe(
          //log error message
          tap(res => console.log(`Did not receive scan state value 2 from API! Please complete the Virtual Retail Companion App scan process.`)),
          //restart in 5 seconds
          delayWhen(res => timer(5 * 1000))
        )
      ), catchError(error => {
        this.loadingAlert.dismiss();
        this.presentAlert(error['status']);
        return throwError('Could not check scan state!: ' + JSON.stringify(error));
      })
    )
  };

  getMeasurements(scan: Scan): Observable<Measurements> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Accept', 'application/json');
    headers = headers.append('Content-Type', 'application/json');

    let body = JSON.stringify({ id: scan.id });
    console.log("getMeasurements() json body to send:", body);

    return this.httpClient.post<Measurements>(
      'http://192.168.0.196:5000/extrameasurement',
      body,
      { headers: headers }
    ).pipe(
      map((data: Measurements) => {
        // console.log('Received data from /getmeasurements: ' + JSON.stringify(data));
        this.currentMeasurements = data;
        this.currentChair = { sh: data['body_depth'] + 3.0, st: data['body_width'], sb: data['elbow_height'] + 2.5, lh: data['lowerleg_length'] - 6.5, ah: data['shoulder_height'] };
        this.loadingAlert.dismiss();
        // this.checkScanState(data).subscribe(async (state: number) => {
        //   console.log('state from checkScanState(): ', state);
        // });
        return data;
      }), catchError(error => {
        this.loadingAlert.dismiss();
        this.presentAlert(error['status']);
        return throwError('Could not get measurements!: ' + JSON.stringify(error));
      })
    )
  };

  confirmMeasurements(measurements: Measurements): Observable<Measurements> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Accept', 'application/json');
    headers = headers.append('Content-Type', 'application/json');

    let body = JSON.stringify({ 'vr_id': this.currentScan.id, 'measurements': measurements });
    // console.log("getMeasurements() json body to send:", body);

    return this.httpClient.post<Measurements>(
      'http://192.168.0.196:5000/measurements',
      body,
      { headers: headers }
    ).pipe(
      map((data: Measurements) => {
        console.log('Received data from /measurements: ' + JSON.stringify(data));
        // this.currentMeasurements = data;
        // this.loadingAlert.dismiss();
        // this.checkScanState(data).subscribe(async (state: number) => {
        //   console.log('state from checkScanState(): ', state);
        // });
        return data;
      }), catchError(error => {
        this.loadingAlert.dismiss();
        this.presentAlert(error['status']);
        return throwError('Could not confirm measurements!: ' + JSON.stringify(error));
      })
    )
  };

  getChairParts(scan: Scan): Observable<ChairParts> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Accept', 'application/json');
    headers = headers.append('Content-Type', 'application/json');
    // console.log("got id: " + scan.id);
    let body = JSON.stringify({ vr_id: scan.id });
    // console.log("checkScanState() json body to send:", body);

    return this.httpClient.post<ChairParts>(
      'http://192.168.0.196:5000/chair_pipe_lengths',
      body,
      { headers: headers }
    ).pipe(
      map((data: ChairParts) => {
        console.log('Received data from /chair_pipe_lengths' + JSON.stringify(data));
        // console.log('Scan state value: ' + JSON.stringify(data[0].state));
        this.currentChairParts = data['length_data'];
        // this.loadingAlert.dismiss();

        return data;
      }),
      retryWhen(errors =>
        errors.pipe(
          //log error message
          tap(res => console.log(`Did not receive chairparts data! Waiting...`)),
          //restart in 5 seconds
          delayWhen(res => timer(5 * 1000))
        )
      ), catchError(error => {
        this.loadingAlert.dismiss();
        this.presentAlert(error['status']);
        return throwError('Could not get chair parts!: ' + JSON.stringify(error));
      })
    )
  };

  produceChairPart(scan: Scan, part: string): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Accept', 'application/json');
    headers = headers.append('Content-Type', 'application/json');
    // console.log("got id: " + scan.id);
    let body = JSON.stringify({ vr_id: scan.id, part: part });
    // console.log("checkScanState() json body to send:", body);

    return this.httpClient.post<any>(
      'http://192.168.0.196:5000/produce',
      body,
      { headers: headers }
    ).pipe(
      map((data: ChairParts) => {
        console.log('Received data from /produce' + JSON.stringify(data));
        // console.log('Scan state value: ' + JSON.stringify(data[0].state));
        // this.currentChairParts = data['length_data'];
        // this.loadingAlert.dismiss();

        return data;
      }),
      retryWhen(errors =>
        errors.pipe(
          //log error message
          tap(res => console.log(`Did not receive chairparts data! Waiting...`)),
          //restart in 5 seconds
          delayWhen(res => timer(5 * 1000))
        )
      ), catchError(error => {
        this.loadingAlert.dismiss();
        this.presentAlert(error['status']);
        return throwError('Could not produce!: ' + JSON.stringify(error));
      })
    )
  };

  reset() {
    this.currentScan = new Scan();
    this.currentMeasurements = new Measurements();
    this.currentChair = new Chair();
    this.currentChairParts = new ChairParts();
  }

  async presentAlert(error: string) {
    this.errorAlert = await this.alertController.create({
      // cssClass: 'my-custom-class',
      header: error + ' Error',
      subHeader: 'Could not connect to API.',
      message: 'Please check your network connection.',
      buttons: ['OK']
    });

    await this.errorAlert.present();

    // const { role } = await this.alert.onDidDismiss();
    // console.log('onDidDismiss resolved with role', role);
  }

  async initLoadingAlert() {
    this.loadingAlert = await this.loadingController.create({
      // cssClass: 'my-custom-class',
      message: 'Please wait...',
      // duration: 5000,
      // translucent: true,
    });

    await this.loadingAlert.onDidDismiss().then(() => {
      console.log('Loading dismissed');
    });
  }

}

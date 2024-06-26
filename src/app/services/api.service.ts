import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { map, catchError, tap, retryWhen, delayWhen, retry, timeout } from 'rxjs/operators';
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

export class KinectScan {
  _id: string;
  body_depth: number;
  body_width: number;
  elbow_height: number;
  lowerleg_length: number;
  shoulder_height: number;
  height: number;
  OgR: number;
  OgL: number;
  UgR: number;
  UgL: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  errorAlert: HTMLIonAlertElement;
  loadingAlert: HTMLIonLoadingElement;
  currentKinectScan: KinectScan = new KinectScan();
  currentScan: Scan = new Scan();
  currentMeasurements: Measurements = new Measurements();
  statusText: string = null;
  currentChair: Chair = new Chair();
  currentChairParts: ChairParts = new ChairParts();
  // api_url: string = 'https://api-pep2021.azurewebsites.net';
  api_url: string = 'http://141.99.133.57:5000';
  //laptop IP: 141.99.133.57

  constructor(
    private httpClient: HttpClient,
    private alertController: AlertController,
    public loadingController: LoadingController,
    private iab: InAppBrowser,
    private browserTab: BrowserTab,
    public platform: Platform,
  ) {
    // this.presentLoadingAlert();
  }
  // TODO: Add method to cancel any running API call subscriptions

  getKinect(): Observable<KinectScan> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Accept', 'application/json');
    headers = headers.append('Content-Type', 'application/json');
    // console.log("createNewScan() headers:", headers);

    return this.httpClient.get<KinectScan>(
      this.api_url + '/kinect',
      { headers: headers }
    ).pipe(
      map((data: KinectScan) => {
        console.log('Received data from /kinect: ' + JSON.stringify(data));
        this.currentKinectScan = data;
        console.log("currentKinectScan _id: ", this.currentKinectScan['_id']);

        this.currentMeasurements = {
          body_depth: this.round(data['measurements']['body_depth'] / 10),
          body_width: this.round(data['measurements']['body_width'] / 10),
          elbow_height: this.round(data['measurements']['elbow_height'] / 10),
          lowerleg_length: this.round(data['measurements']['lowerleg_length'] / 10),
          shoulder_height: this.round(data['measurements']['shoulder_height'] / 10),
          height: this.round(data['measurements']['height'] / 10)
        };
        this.currentChair = {
          sh: this.round((data['measurements']['body_depth'] + 3.0) / 10),
          st: this.round(data['measurements']['body_width'] / 10),
          sb: this.round((data['measurements']['elbow_height'] + 2.5) / 10),
          lh: this.round((data['measurements']['lowerleg_length'] - 6.5) / 10),
          ah: this.round(data['measurements']['shoulder_height'] / 10)
        };
        this.currentChairParts = {
          OgR: this.round(data['length_data']['OgR'] / 100),
          OgL: this.round(data['length_data']['OgR'] / 100),
          UgR: this.round(data['length_data']['UgR'] / 100),
          UgL: this.round(data['length_data']['UgL'] / 100)
        };
        // this.checkScanState(data).subscribe(async (state: number) => {
        //   console.log('state from checkScanState(): ', state);
        // });
        return data;
      }), timeout(8000),
      catchError(error => {
        this.presentAlert(error['status'] ? error['status'] : error['name']);
        return throwError('Could not get Kinect scan!: ' + JSON.stringify(error));
      })
    )
  };

  createNewScan(): Observable<Scan> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Accept', 'application/json');
    headers = headers.append('Content-Type', 'application/json');
    // console.log("createNewScan() headers:", headers);

    return this.httpClient.get<Scan>(
      this.api_url + '/createscan',
      { headers: headers }
    ).pipe(
      map((data: Scan) => {
        // console.log('Received data from /createscan: ' + JSON.stringify(data));
        this.currentScan = data;
        // this.checkScanState(data).subscribe(async (state: number) => {
        //   console.log('state from checkScanState(): ', state);
        // });
        return data;
      }), timeout(8000),
      catchError(error => {
        this.presentAlert(error['status'] ? error['status'] : error['name']);
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
      this.api_url + '/checkstate',
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
        this.dismissLoadingAlert();
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
      this.api_url + '/extrameasurement',
      body,
      { headers: headers }
    ).pipe(
      map((data: Measurements) => {
        // console.log('Received data from /getmeasurements: ' + JSON.stringify(data));
        this.currentMeasurements = data;
        this.currentChair = {
          sh: this.round(data['body_depth'] + 3.0),
          st: this.round(data['body_width']),
          sb: this.round(data['elbow_height'] + 2.5),
          lh: this.round(data['lowerleg_length'] - 6.5),
          ah: this.round(data['shoulder_height'])
        };
        // this.dismissLoadingAlert();
        // this.checkScanState(data).subscribe(async (state: number) => {
        //   console.log('state from checkScanState(): ', state);
        // });
        return data;
      }),
      retryWhen(errors =>
        errors.pipe(
          //log error message
          tap(res => console.log(`Could not get measurement data. Retrying...`)),
          //restart in 5 seconds
          delayWhen(res => timer(5 * 1000))
        )
      ), timeout(8000),
      catchError(error => {
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
      this.api_url + '/measurements',
      body,
      { headers: headers }
    ).pipe(
      map((data: Measurements) => {
        console.log('Received data from /measurements: ' + JSON.stringify(data));
        // this.currentMeasurements = data;
        // this.dismissLoadingAlert();
        // this.checkScanState(data).subscribe(async (state: number) => {
        //   console.log('state from checkScanState(): ', state);
        // });
        return data;
      }),
      retryWhen(errors =>
        errors.pipe(
          //log error message
          tap(res => console.log(`Could not confirm measurement data. Retrying...`)),
          //restart in 5 seconds
          delayWhen(res => timer(5 * 1000))
        )
      ), timeout(8000),
      catchError(error => {
        this.dismissLoadingAlert();
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
      this.api_url + '/chair_pipe_lengths',
      body,
      { headers: headers }
    ).pipe(
      map((data: ChairParts) => {
        console.log('Received data from /chair_pipe_lengths' + JSON.stringify(data));
        // console.log('Scan state value: ' + JSON.stringify(data[0].state));
        this.currentChairParts = {
          OgR: this.round(data['length_data']['OgR'] / 10),
          OgL: this.round(data['length_data']['OgR'] / 10),
          UgR: this.round(data['length_data']['UgR'] / 10),
          UgL: this.round(data['length_data']['UgL'] / 10)
        };
        // this.dismissLoadingAlert();

        return data;
      }),
      retryWhen(errors =>
        errors.pipe(
          //log error message
          tap(res => console.log(`Did not receive chair part length data! Waiting...`)),
          //restart in 5 seconds
          delayWhen(res => timer(5 * 1000))
        )
      ), timeout(8000),
      catchError(error => {
        this.dismissLoadingAlert();
        this.presentAlert(error['status']);
        return throwError('Could not get chair part lengths!: ' + JSON.stringify(error));
      })
    )
  };

  produceChairPart(part: string, scan?: Scan, kinect?: KinectScan): Observable<any> {
    let headers: HttpHeaders = new HttpHeaders();
    headers = headers.append('Accept', 'application/json');
    headers = headers.append('Content-Type', 'application/json');
    // console.log("got id: " + scan.id);
    let body;
    if (scan) {
      body = JSON.stringify({ vr_id: scan.id, part: part });
    } else if (kinect) {
      body = JSON.stringify({ _id: kinect._id, part: part });
    }
    // console.log("checkScanState() json body to send:", body);

    return this.httpClient.post<any>(
      this.api_url + '/produce',
      body,
      { headers: headers }
    ).pipe(
      map((data: ChairParts) => {
        console.log('Received data from /produce' + JSON.stringify(data));
        // console.log('Scan state value: ' + JSON.stringify(data[0].state));
        // this.currentChairParts = data['length_data'];

        return data;
      }),
      retryWhen(errors =>
        errors.pipe(
          //log error message
          tap(res => console.log(`Could not create produce task. Retrying...`)),
          //restart in 5 seconds
          delayWhen(res => timer(5 * 1000))
        )
      ), timeout(8000),
      catchError(error => {
        this.dismissLoadingAlert();
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
    this.currentKinectScan = new KinectScan();
  }

  async presentAlert(error?: string) {
    this.errorAlert = await this.alertController.create({
      // cssClass: 'my-custom-class',
      backdropDismiss: false,
      header: error,
      subHeader: 'Could not connect to API.',
      message: 'Please check your network connection and try again.',
      buttons: ['OK']
    });

    await this.errorAlert.present();

    // const { role } = await this.alert.onDidDismiss();
    // console.log('onDidDismiss resolved with role', role);
  }

  async presentLoadingAlert() {
    this.loadingAlert = await this.loadingController.create({
      // cssClass: 'my-custom-class',
      message: 'Lade...',
      // duration: 5000,
      // translucent: true,
    });

    await this.loadingAlert.present();

    await this.loadingAlert.onDidDismiss().then(() => {
      console.log('Loading dismissed');
    });
  }

  async dismissLoadingAlert() {
    try {
      await this.loadingAlert.dismiss();
      console.log('dismiss');
    } catch {

    }
  }

  round(num: number): number {
    return Math.round(num * 100) / 100
  }
}

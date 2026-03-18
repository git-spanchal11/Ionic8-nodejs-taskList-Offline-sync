import { Injectable, NgZone } from '@angular/core';
import { Network } from '@capacitor/network';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  private onlineStatus = new BehaviorSubject<boolean>(true);
  isOnline$ = this.onlineStatus.asObservable();

  constructor(private ngZone: NgZone) {
    this.initNetworkListener();
  }

  /**
   * Returns the current online status.
   */
  get currentStatus(): boolean {
    return this.onlineStatus.value;
  }

  /**
   * Initializes the network listener and updates status accordingly.
   */
  private async initNetworkListener() {
    const status = await Network.getStatus();
    this.onlineStatus.next(status.connected);

    Network.addListener('networkStatusChange', (status) => {
      this.ngZone.run(() => {
        this.onlineStatus.next(status.connected);
      });
    });
  }
}

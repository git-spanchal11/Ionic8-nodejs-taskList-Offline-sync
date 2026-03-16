import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Storage | null = null;
  private storageReady = false;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
    this.storageReady = true;
  }

  public async set(key: string, value: any) {
    await this.ensureInit();
    await this._storage?.set(key, value);
  }

  public async get(key: string) {
    await this.ensureInit();
    return await this._storage?.get(key);
  }

  public async remove(key: string) {
    await this.ensureInit();
    return await this._storage?.remove(key);
  }

  private async ensureInit() {
    while (!this.storageReady) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
}

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

  /**
   * Initializes the Ionic Storage engine.
   */
  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
    this.storageReady = true;
  }

  /**
   * Sets a value in persistent storage for a given key.
   */
  public async set(key: string, value: any) {
    await this.ensureInit();
    await this._storage?.set(key, value);
  }

  /**
   * Retrieves a value from persistent storage for a given key.
   */
  public async get(key: string) {
    await this.ensureInit();
    return await this._storage?.get(key);
  }

  /**
   * Removes a value from persistent storage for a given key.
   */
  public async remove(key: string) {
    await this.ensureInit();
    return await this._storage?.remove(key);
  }

  /**
   * Ensures storage is initialized before any operations are performed.
   */
  private async ensureInit() {
    while (!this.storageReady) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
}

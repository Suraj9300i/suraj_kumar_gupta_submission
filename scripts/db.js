"use strict";

export default class ChatDatabase {
  constructor() {
    this.dbName = "https://maang.in";
    this.db = null;
    this.storeName;
  }

  async init(storeName) {
    try {
      this.storeName = storeName;
      const request = indexedDB.open(this.dbName);

      return new Promise((resolve, reject) => {
        request.onsuccess = async event => {
          const db = event.target.result;
          // Check if the store exists
          if (db.objectStoreNames.contains(storeName)) {
            console.log(`Store "${storeName}" exists.`);
            this.db = db;
            resolve(db);
          } else {
            db.close();
            console.log(`Store "${storeName}" does not exist. Adding store...`);

            this.addStore(storeName)
              .then(newDb => {
                this.db = newDb;
                resolve(newDb);
              })
              .catch(err => reject(err));
          }
        };

        request.onerror = event => {
          console.error("Error initializing database:", event.target.error);
          reject(event.target.error);
        };
      });
    } catch (err) {
      console.error("Error in init method:", err);
      throw err;
    }
  }

  async addStore(storeName) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName);

      request.onsuccess = event => {
        const db = event.target.result;
        const currentVersion = db.version;
        db.close();

        const upgradeRequest = indexedDB.open(this.dbName, currentVersion + 1);

        upgradeRequest.onupgradeneeded = event2 => {
          const upgradeDb = event2.target.result;
          if (!upgradeDb.objectStoreNames.contains(storeName)) {
            upgradeDb.createObjectStore(storeName, {
              keyPath: "id",
              autoIncrement: true
            });
            console.log(`Store "${storeName}" created with keyPath "id".`);
          }
        };

        upgradeRequest.onsuccess = event2 => {
          console.log(
            `Database upgraded to version ${currentVersion +
              1}. Store "${storeName}" added.`
          );
          resolve(event2.target.result);
        };

        upgradeRequest.onerror = event2 => {
          console.error("Error upgrading database:", event2.target.error);
          reject(event2.target.error);
        };
      };

      request.onerror = event => {
        console.error("Error opening database:", event.target.error);
        reject(event.target.error);
      };
    });
  }

  async addMessage(message) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        return reject("Database is not initialized.");
      }

      if (typeof message !== "object" || !message.text || !message.type) {
        console.error("Invalid message format:", message);
        return reject("Invalid message format:");
      }

      const transaction = this.db.transaction(this.storeName, "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.add({
        ...message,
        timestamp: Date.now()
      });

      request.onsuccess = () => {
        console.log("Chat message added:", message);
        resolve();
      };

      request.onerror = event => {
        console.error("Error adding chat message:", event.target.error);
        reject(event.target.error);
      };
    });
  }

  async getAllMessages() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        return reject("Database is not initialized.");
      }

      const transaction = this.db.transaction(this.storeName, "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = event => {
        console.log("Fetched all chat messages:", event.target.result);
        resolve(event.target.result);
      };

      request.onerror = event => {
        console.error("Error fetching chat messages:", event.target.error);
        reject(event.target.error);
      };
    });
  }
}

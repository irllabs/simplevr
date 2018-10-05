import { Injectable } from "@angular/core"
import { AngularFirestore } from "angularfire2/firestore"

@Injectable()
export class SettingsService {
  private _settings: any

  constructor(private afStore: AngularFirestore) {}

  public get settings() {
    return this._settings
  }

  public setupSettings() {
    return this.afStore
      .collection("settings")
      .doc("public")
      .ref.get()
      .then(result => {
        this._settings = result.data()
        return
      })
  }
}

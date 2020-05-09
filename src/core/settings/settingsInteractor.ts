import * as firebase from 'firebase';

class SettingsInteractor {
	private _settings: firebase.firestore.DocumentData
	private _db: firebase.firestore.Firestore;

	constructor() {
		this._db = firebase.firestore();
		this.setupSettings();
	}

	public get settings() {
		return this._settings
	}

	public setupSettings() {
		const doc = this._db.collection("settings").doc("public");
		doc.onSnapshot(result => {
			this._settings = result.data()
		})
	}
}
export default new SettingsInteractor();

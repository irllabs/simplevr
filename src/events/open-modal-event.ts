export interface OpenModalEventData {
	headerText: string;
	bodyText: string;
	isMessage: boolean;
	modalType: string;
	promise?: Promise<any>;
	shareableData?: any;
	callback?: (isDualScreen: boolean) => void;
}

interface Subscriber {
	callback: (data: OpenModalEventData) => void;
	id: string;
}

class OpenModalEvent {
	private subscribers: Array<Subscriber> = [];
	
	public emit(data: OpenModalEventData): void {
		this.subscribers.forEach((subscriber) => {
			subscriber.callback(data);
		});
	}

	public emitAsync(data: OpenModalEventData): Promise<{accepted: boolean}> {
		let promise;
		this.subscribers.forEach((subscriber) => {
			promise = subscriber.callback(data);
		});
		return promise;
	}

	public subscribe(subscriber: Subscriber): void {
		this.subscribers.push(subscriber);
	}

	public unsubscribe(subscriberId: string): void {
		this.subscribers = this.subscribers.filter((subscriber) => {
			return subscriber.id !== subscriberId;
		});
	}
}
export default new OpenModalEvent();

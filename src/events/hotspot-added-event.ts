export interface HotspotAddedEventData {
	id: string;
}

interface Subscriber {
	callback: (data: HotspotAddedEventData) => void;
	id: string;
}

class HotspotAddedEvent {
	private subscribers: Array<Subscriber> = [];
	
	public emit(data: HotspotAddedEventData): void {
		this.subscribers.forEach((subscriber) => {
			subscriber.callback(data);
		});
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
export default new HotspotAddedEvent();

export interface OpenModalEventData {
	headerText: string;
	bodyText: string;
	isMessage: boolean;
	modalType: string;
}

class EventManager<T> {
	private subscribers: Array<{
		callback: (data: T) => void;
		id: string;
	}> = [];
	
	public emit(data: T): void {
		this.subscribers.forEach((subscriber) => {
			subscriber.callback(data);
		});
	}

	public emitAsync(data: T) {
		const promises = [];
		this.subscribers.forEach((subscriber) => {
			promises.push(subscriber.callback(data));
		});
		return Promise.all(promises);
	}

	public subscribe(subscriber: {
		callback: (data: T) => void;
		id: string;
	}): void {
		this.subscribers.push(subscriber);
	}

	public unsubscribe(subscriberId: string): void {
		this.subscribers = this.subscribers.filter((subscriber) => {
			return subscriber.id !== subscriberId;
		});
	}
}

export const hotspotRemovedEvent = new EventManager<{}>();
export const roomsUpdatedEvent = new EventManager<{}>();
export const propertyAddedEvent = new EventManager<{}>();

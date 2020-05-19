export interface OpenStoryEventData {
	preview: boolean;
}

interface Subscriber {
	callback: (data: OpenStoryEventData) => void;
	id: string;
}

class OpenStoryEvent {
	private subscribers: Array<Subscriber> = [];
	
	public emit(data?: OpenStoryEventData): void {
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
export default new OpenStoryEvent();

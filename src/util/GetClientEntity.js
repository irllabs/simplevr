import NAF from 'networked-aframe';

export function getClientEntity(clientId, entityType) {
	for (const entityName in NAF.entities.entities) {
		const entity = NAF.entities.entities[entityName];

		const entityOwner = entity.components.networked.data.owner;

		if (entityOwner !== clientId) {
			continue;
		}

		return entity.components[entityType];
	}
}

export function getClientSound(clientId) {
	return getClientEntity(clientId, 'networked-audio-source').sound;
}


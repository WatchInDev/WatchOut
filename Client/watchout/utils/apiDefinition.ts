import { API_URL } from './../config';
export type ApiDefinition = {
  key: string[];
  endpoint: string;
};

class BaseApi {
  protected readonly baseUrl: string = API_URL;
  protected constructor(additionalPath: string) {
    this.baseUrl = `${this.baseUrl}/${additionalPath}`;
  }
}

class EventApi extends BaseApi {
  constructor() {
    super('events');
  }

  getClusters({ swLat, swLng, neLat, neLng }: { 
    swLat: number; 
    swLng: number; 
    neLat: number; 
    neLng: number 
  }): string {
    return `${this.baseUrl}/clusters?swLat=${swLat}&swLng=${swLng}&neLat=${neLat}&neLng=${neLng}`;
  }
}

class EventTypeApi extends BaseApi {
  constructor() {
    super('event-types');
  }

  getAll = `${this.baseUrl}`;
}

export const API_ENDPOINTS = {
  events: new EventApi(),
  eventTypes: new EventTypeApi(),
};
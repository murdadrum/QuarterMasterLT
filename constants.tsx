
import React from 'react';
import { Endpoint, EndpointStatus, EndpointType } from './types';

export const INITIAL_ENDPOINTS: Endpoint[] = [
  {
    id: '1',
    name: 'Main Production API',
    url: 'https://api.acme-corp.com/v1',
    type: EndpointType.API,
    status: EndpointStatus.ONLINE,
    lastChecked: new Date(),
    avgLatency: 45,
    uptime: 99.98,
    history: Array.from({ length: 20 }, (_, i) => ({
      timestamp: `${i}:00`,
      latency: 40 + Math.random() * 20
    }))
  },
  {
    id: '2',
    name: 'User Authentication Service',
    url: 'https://auth.acme-corp.com',
    type: EndpointType.API,
    status: EndpointStatus.DEGRADED,
    lastChecked: new Date(),
    avgLatency: 210,
    uptime: 98.5,
    history: Array.from({ length: 20 }, (_, i) => ({
      timestamp: `${i}:00`,
      latency: 180 + Math.random() * 100
    }))
  },
  {
    id: '3',
    name: 'Asset Delivery CDN',
    url: 'https://cdn.acme-corp.com/static',
    type: EndpointType.CDN,
    status: EndpointStatus.ONLINE,
    lastChecked: new Date(),
    avgLatency: 12,
    uptime: 100,
    history: Array.from({ length: 20 }, (_, i) => ({
      timestamp: `${i}:00`,
      latency: 10 + Math.random() * 5
    }))
  },
  {
    id: '4',
    name: 'Customer Support Portal',
    url: 'https://support.acme-corp.com',
    type: EndpointType.WEBSITE,
    status: EndpointStatus.OFFLINE,
    lastChecked: new Date(),
    avgLatency: 0,
    uptime: 94.2,
    history: Array.from({ length: 20 }, (_, i) => ({
      timestamp: `${i}:00`,
      latency: 0
    }))
  }
];

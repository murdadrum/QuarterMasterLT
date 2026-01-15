
export enum EndpointStatus {
  ONLINE = 'online',
  DEGRADED = 'degraded',
  OFFLINE = 'offline',
  CHECKING = 'checking'
}

export enum EndpointType {
  API = 'API',
  LINK = 'Link',
  WEBSITE = 'Website',
  CDN = 'CDN'
}

export interface MetricData {
  timestamp: string;
  latency: number;
}

export interface Endpoint {
  id: string;
  name: string;
  url: string;
  type: EndpointType;
  status: EndpointStatus;
  lastChecked: Date;
  avgLatency: number;
  uptime: number;
  history: MetricData[];
}

export interface HealthReport {
  summary: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  recommendations: string[];
}

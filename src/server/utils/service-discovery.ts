
export interface ServiceDiscovery {
  getRpcUrl(defaultUrl?: string): string;
  getHorizonUrl(defaultUrl?: string): string;
}


export class EnvServiceDiscovery implements ServiceDiscovery {
  getRpcUrl(defaultUrl?: string): string {
    return process.env.STELLAR_RPC_URL || defaultUrl || "";
  }

  getHorizonUrl(defaultUrl?: string): string {
    return process.env.STELLAR_HORIZON_URL || defaultUrl || "";
  }
}


export class MockServiceDiscovery implements ServiceDiscovery {
  constructor(
    private readonly rpcUrl: string = "http://localhost:8000/rpc",
    private readonly horizonUrl: string = "http://localhost:8000"
  ) {}

  getRpcUrl(_defaultUrl?: string): string {
    return this.rpcUrl;
  }

  getHorizonUrl(_defaultUrl?: string): string {
    return this.horizonUrl;
  }
}


export function getServiceDiscovery(): ServiceDiscovery {
  if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
    return new MockServiceDiscovery();
  }
  return new EnvServiceDiscovery();
}

export interface VersionedItem {
  version: string;
  hash: string;
}

export interface ConfigResponse {
  version: {
    required: string;
    store: string;
  };
  backend_entry_point: {
    jsonrpc_url: string;
  };
  assets: {
    version: string;
    hash: string;
    urls: string[];
  };
  definitions: {
    version: string;
    hash: string;
    urls: string[];
  };
  notifications: {
    jsonrpc_url: string;
  };
}

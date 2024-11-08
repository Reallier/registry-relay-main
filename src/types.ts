export interface WWWAuthenticate {
	realm: string;
	service: string;
	scope?: string;
}

export interface RegistryConfig {
	registry: string;
	authenticate?: {
		path: string;
		host: string;
	};
}

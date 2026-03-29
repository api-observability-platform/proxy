export type ProxyType = {
	baseDomain: string;
	/** When > 0, binds a gRPC gateway (unary envelope forwarder) on this port. */
	grpcProxyPort: number;
};

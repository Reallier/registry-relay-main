import { RegistryConfig } from './types';


// 修复获取 Token 的问题
export const fixAuthenticate = (newUrl: URL, newHeaders: Headers, upstream: RegistryConfig): {
	url: URL,
	headers: Headers
} => {
	// 首先 authenticate 不为空,其次路径符合 authenticate.path
	if (!upstream.authenticate) {
		return { url: newUrl, headers: newHeaders };
	}
	if (newUrl.pathname == upstream.authenticate.path) {
		// 那么重写 accessURL.hostname 为 authenticate.host
		newUrl.hostname = upstream.authenticate.host;
	}
	return { url: newUrl, headers: newHeaders };
};

// 修正 DockerHub 缩写镜像地址
export const fixDockerHubImage = (newUrl: URL, newHeaders: Headers, upstream: RegistryConfig): {
	url: URL,
	headers: Headers
} => {
	if (upstream.registry != 'registry-1.docker.io') {
		return { url: newUrl, headers: newHeaders };
	}
	// 如果是 docker.io,则替换为 docker.io/library
	// 修复 /v2/busybox/manifests/latest => /v2/library/busybox/manifests/latest
	const pathParts = newUrl.pathname.split('/');
	if (pathParts.length == 5) {
		pathParts.splice(2, 0, 'library');
		const redirectUrl = new URL(newUrl);
		redirectUrl.pathname = pathParts.join('/');
		// return Response.redirect(redirectUrl.toString(), 301);
		newUrl = redirectUrl;
	}
	return { url: newUrl, headers: newHeaders };

};

// 对 GCR 的 blobs 请求移除掉 Authorization
export const removeGCRBlobsAuth = (newUrl: URL, newHeaders: Headers, upstream: RegistryConfig): {
	url: URL,
	headers: Headers
} => {
	if (upstream.registry != 'gcr.io') {
		return { url: newUrl, headers: newHeaders };
	}
	// 如果是 GCR 并且路径含有 blobs 则移除掉 headers 中的 Authorization
	if (newUrl.pathname.includes('blobs')) {
		newHeaders.delete('Authorization');
	}
	return { url: newUrl, headers: newHeaders };
};


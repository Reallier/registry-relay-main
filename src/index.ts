import { RegistryConfig, WWWAuthenticate } from './types';
import { fixAuthenticate, fixDockerHubImage, removeGCRBlobsAuth } from './patches';

export interface Env {
	DOCKERHUB_ACCESS_DOMAIN: string;
	K8S_ACCESS_DOMAIN: string;
	QUAY_ACCESS_DOMAIN: string;
	GCR_ACCESS_DOMAIN: string;
	GHCR_ACCESS_DOMAIN: string;
	ELASTIC_ACCESS_DOMAIN: string;
	CRUNCHYDATA_ACCESS_DOMAIN: string;
	// NVIDIA
	NVCR_ACCESS_DOMAIN: string;
	// LinuxServer.io
	LSCR_ACCESS_DOMAIN: string;
	// 微软
	MCR_ACCESS_DOMAIN: string;
	// GitLab
	GITLAB_ACCESS_DOMAIN: string;
}

const generatePairs = (env: Env) => {
	const domainPairs: Record<string, RegistryConfig> = {
		// 谷歌家
		[env.K8S_ACCESS_DOMAIN]: {
			registry: 'registry.k8s.io',
		},
		[env.GCR_ACCESS_DOMAIN]: {
			registry: 'gcr.io',
		},
		// 红帽家
		[env.QUAY_ACCESS_DOMAIN]: {
			registry: 'quay.io',
		},
		// DockerHub
		[env.DOCKERHUB_ACCESS_DOMAIN]: {
			registry: 'registry-1.docker.io',
			authenticate: {
				path: '/token',
				host: 'auth.docker.io',
			},
		},
		// GitHub
		[env.GHCR_ACCESS_DOMAIN]: {
			registry: 'ghcr.io',
		},
		// Elastic 家
		[env.ELASTIC_ACCESS_DOMAIN]: {
			registry: 'docker.elastic.co',
			authenticate: {
				path: '/auth',
				host: 'docker-auth.elastic.co',
			},
		},
		// CrunchyData
		[env.CRUNCHYDATA_ACCESS_DOMAIN]: {
			registry: 'registry.developers.crunchydata.com',
		},
		// NVIDIA
		[env.NVCR_ACCESS_DOMAIN]: {
			registry: 'nvcr.io',
		},
		// LinuxServer.io
		[env.LSCR_ACCESS_DOMAIN]: {
			registry: 'lscr.io',
		},
		// 微软
		[env.MCR_ACCESS_DOMAIN]: {
			registry: 'mcr.microsoft.com',
		},
		// GitLab
		[env.GITLAB_ACCESS_DOMAIN]: {
			registry: 'registry.gitlab.com',
			authenticate: {
				path: '/jwt/auth',
				host: 'gitlab.com',
			},
		},
	};
	return domainPairs;
};

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		ctx.passThroughOnException();
		const domainPairs = generatePairs(env);
		// 提取 URL 修改
		let accessURL = new URL(request.url);
		// 对于访问 / 的请求,直接返回 403
		if (accessURL.pathname == '/') {
			return new Response('Error', { status: 403 });
		}
		let accessHost = accessURL.hostname;
		// 判断域名,不带端口号
		let upstream = domainPairs[accessHost];
		if (!upstream) {
			return new Response('Error', { status: 403 });
		}
		accessURL.hostname = upstream.registry;
		accessURL.port = '443';
		accessURL.protocol = 'https';

		// 组装一个新的 URL
		let newUrl = new URL(accessURL);
		// 拉一个可以修改的 Headers
		let newHeaders = new Headers(request.headers);
		// 使用判决链来让设计优雅
		const requestPatchChain = [fixAuthenticate, fixDockerHubImage, removeGCRBlobsAuth];
		for (const process of requestPatchChain) {
			const result = process(newUrl, newHeaders, upstream);
			newUrl = result.url;
			newHeaders = result.headers;
		}
		console.log('newURL', newUrl.toString());
		const newReq = new Request(newUrl, {
			method: request.method,
			headers: newHeaders,
			redirect: 'follow',
		});
		const resp = await fetch(newReq);
		const modifiedRespForClient = new Response(resp.body, resp);
		// 适配一些客户端怪癖,例如 BuildKit
		// 他不会先请求 /v2/ 而是直接 Head 到整个全路径
		// 那我就直接全改了,如果有就改
		const wwwAuth = resp.headers.get('www-authenticate');
		if (wwwAuth) {
			const wwwAuthenticate = parseAuthenticate(wwwAuth);
			console.log('relam', wwwAuthenticate.realm);
			// console.log(newWwwAuth);
			// 匹配 realm 中的域名部分
			const realmHost = new URL(wwwAuthenticate.realm).hostname;
			// 替换 realm 中的域名部分
			const newWwwAuth = wwwAuth.replace(realmHost, accessHost);
			// 组装新的 WWW-Authenticate
			modifiedRespForClient.headers.set('www-authenticate', newWwwAuth);
		}
		return modifiedRespForClient;
	},
} satisfies ExportedHandler;

function parseAuthenticate(authenticateStr: string): WWWAuthenticate {
	// sample: Bearer realm="https://auth.ipv6.docker.com/token",service="registry.docker.io"
	// 先拆掉 Bearer
	const parts = authenticateStr.split(' ');
	const wwwAuthenticate: WWWAuthenticate = { realm: '', service: '', scope: '' };
	for (const part of parts) {
		const [key, value] = part.split('=');
		if (key === 'realm') {
			wwwAuthenticate.realm = value.replace(/"/g, '');
		} else if (key === 'service') {
			wwwAuthenticate.service = value.replace(/"/g, '');
		} else if (key === 'scope') {
			wwwAuthenticate.scope = value.replace(/"/g, '');
		}
	}
	return wwwAuthenticate;
}

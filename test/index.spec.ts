// test/index.spec.ts
import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import worker from '../src/index';

// For now, you'll need to do something like this to get a correctly-typed
// `Request` to pass to `worker.fetch()`.
const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe('Hello World worker', () => {
	it('测试是否能返回 /v2/', async () => {
		const request = new IncomingRequest('https://elastic.example-access.com/v2/', {
			headers: { 'User-Agent': 'Mozilla/5.0' }
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		console.log(response.headers);
		// 确保含有 www-authenticate
		expect(response.headers.get('www-authenticate')).not.toBeNull();
	});
	it('测试 auth 地址能否正确取得,以 dockerhub 为例', async () => {
		const request = new IncomingRequest('https://dhcr.example-access.com/token');
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		// console.log(await response.text());
		// 确保返回的是 JSON 并且有 token 字段
		const json = await response.json();
		expect(json).toHaveProperty('token');
	});
	it('测试 auth 地址能否正确取得,以 elastic  为例', async () => {
		const request = new IncomingRequest('https://elastic.example-access.com/auth');
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		// console.log(await response.text());
		// 确保返回的是 JSON 并且有 access_token 字段
		const json = await response.json();
		expect(json).toHaveProperty('access_token');
	});


});

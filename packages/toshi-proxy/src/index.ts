// import { Env } from './index'; // Import the Env interface from the same file
/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;
	HOSTNAME: string;
	MY_RATE_LIMITER: any;
	API_KEY: string;
}
//
const NO_STORE_PATHNAMES = ['/api/healthcheck'] as string[];

function getTTl(pathname: string) {
	if (NO_STORE_PATHNAMES.includes(pathname)) return 0;

	if (pathname.includes('simple')) return 300;

	return 86400;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);
		const { pathname } = url;

		function MethodNotAllowed(request: Request) {
			return new Response(`Method ${request.method} not allowed.`, {
				status: 405,
				headers: {
					Allow: 'GET',
				},
			});
		}

		async function StrictPathname() {
			return new Response('Invalid API Request', {
				status: 401,
			});
		}

		if (request.method !== 'GET') return MethodNotAllowed(request);

		// console.log(url.pathname, 'url.pathname');
		if (!/^\/api\/(prices|range|healthcheck)/.test(url.pathname)) {
			return StrictPathname();
		}

		const { success } = await env.MY_RATE_LIMITER.limit({ key: pathname }); // key can be any string of your choosing
		if (!success) {
			return new Response(`429 Failure – rate limit exceeded for ${pathname}`, { status: 429 });
		}

		// Change the URL to the host you want to proxy to
		// url.hostname = env.HOSTNAME; // Use env.HOSTNAME instead of HOSTNAME
		// url.hostname = env.HOSTNAME; //'https://toshimoto.app';

		// Create a new request with the updated URL
		const requestUrl = env.HOSTNAME + url.pathname + url.search;

		const newHeaders = new Headers(request.headers);
		newHeaders.append('x-api-key', env.API_KEY);

		const newRequest = new Request(requestUrl, {
			method: request.method,
			headers: newHeaders,
			body: request.body,
		});

		// const resp = await
		// console.log(newRequest);
		// Fetch the response from the new URL
		const someCustomKey = `http://${url.hostname}${url.pathname}?${url.search}`;
		const ttl = getTTl(url.pathname);
		const response = await fetch(newRequest, {
			headers: newHeaders,
			cf: {
				// Always cache this fetch regardless of content type
				// for a max of 5 seconds before revalidating the resource
				cacheTtl: ttl,
				cacheEverything: true,
				//Enterprise only feature, see Cache API for other plans
				cacheKey: someCustomKey,
			},
		});

		// @ts-ignore
		const resp = new Response(response.body, {
			status: response.status,
			statusText: response.statusText,
			headers: response.headers,
		});

		resp.headers.set('Cache-Control', `public,max-age=${ttl}`);

		return resp;
	},
};

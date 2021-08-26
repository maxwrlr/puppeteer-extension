import * as express from 'express';
import {Page} from 'puppeteer';
import {ChildProcess} from 'child_process';

interface IPoll {
	timeout: NodeJS.Timeout;
	request: express.Request;
	response: express.Response;
}

interface ITask {
	/**
	 * An ID of an object, that should be the target of the action.
	 */
	ref?: any;

	name: string;
	args: any[];
	resolve: (value: any) => void;
	reject: (reason?: any) => void;
}

export class Browser {
	private readonly _process?: ChildProcess;
	private readonly _pageProxy: ProxyHandler<{ id: number }>;

	// required for communication
	private _scheduledTasks: ITask[]  = [];
	private _activeTask: ITask | null = null;
	private _activePoll: IPoll | null = null;

	constructor(process?: ChildProcess) {
		this._process   = process;
		this._pageProxy = {
			get: (target, prop: string) => {
				if(prop === 'then') {
					return undefined;
				} else {
					return (...args: any) => this._execute(target.id, `Page.${prop}`, args);
				}
			}
		};
	}

	middleware(): express.Handler {
		return (request, response) => {
			if(request.headers['content-type'] !== 'application/json') {
				return response.status(400).send(`Invalid 'Content-Type': expected 'application/json'.`);
			}

			// only one poller is allowed
			if(this._activePoll) {
				return response.status(503).send('Somebody is already polling.');
			}

			// handle response of active task
			const msg = request.body;
			if(this._activeTask) {
				if(msg.error) {
					this._activeTask.reject(new Error(msg.error));
				} else {
					this._activeTask.resolve(msg.payload);
				}
				this._activeTask = null;
			}

			// check if another task is planned
			if(this._scheduledTasks.length) {
				// mark task as active and send back for handling
				const task       = this._scheduledTasks.shift()!;
				this._activeTask = task;
				response.send(task);
				return;
			}

			// if no task is planned yet, keep browser in line for notification.
			this._activePoll = {
				request,
				response,
				timeout: setTimeout(() => {
					response.send(null);
					this._activePoll = null;
				}, 30_000)
			};
		};
	}

	private _execute<T = unknown>(ref: any, name: string, args: any[] = []): Promise<T> {
		return new Promise((resolve, reject) => {
			const task = {
				ref,
				name,
				args,
				resolve,
				reject
			};

			// schedule or start task
			if(this._activePoll) {
				clearTimeout(this._activePoll.timeout);
				this._activePoll.response.send(task);
				this._activeTask = task;
				this._activePoll = null;
			} else {
				this._scheduledTasks.push(task);
			}
		});
	}

	private _createPageProxy(id: number): Page {
		return new Proxy({ id }, this._pageProxy) as any;
	}

	async newPage(): Promise<Page> {
		const pageId = await this._execute<number>(null, 'Browser.newPage');
		return this._createPageProxy(pageId);
	}

	async pages(): Promise<Page[]> {
		const pages = await this._execute<number[]>(null, 'Browser.pages');
		return pages.map(id => this._createPageProxy(id));
	}

	close() {
		if(this._process) {
			this._process.kill();
		}
	}
}

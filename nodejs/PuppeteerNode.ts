import {Browser} from './Browser';
import {ChildProcess, execFile} from 'child_process';
import type {LaunchOptions} from 'puppeteer';

/**
 * Promise-based function for starting the process.
 */
function execBrowserAsync(path: string): Promise<ChildProcess> {
	return new Promise((resolve, reject) => {
		const process = execFile(path)
			.once('spawn', () => {
				// started successfully. don't care about runtime errors
				process.off('error', reject);
				resolve(process);
			})
			.once('error', reject);
	});
}

export class PuppeteerNode {
	/**
	 * Create a browser instance. A browser process will only be started if `options.executablePath` was defined.
	 * @param options - Only `options.executablePath` works.
	 */
	async launch(options?: LaunchOptions): Promise<Browser> {
		let process: ChildProcess | undefined = undefined;
		if(options?.executablePath) {
			process = await execBrowserAsync(options.executablePath);
		}

		return new Browser(process);
	}
}

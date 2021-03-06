const url = 'http://localhost:8088/api/bridge/puppeteer';
let time  = 0;

chrome.runtime.onInstalled.addListener(main);
chrome.runtime.onStartup.addListener(main);

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
	if(msg.topic === '@/polls') {
		sendResponse('Last poll: ' + time);
	}
});

async function main() {
	let data = null;
	for(; ;) {
		try {
			time = Date.now();
			data = await pollTask(data);
			if(data === false) {
				break;
			}
		} catch(err) {
			data = { error: err };
			console.debug(err)
			await new Promise(r => setTimeout(r, 10_000));
		}
	}
}

async function pollTask(data: any) {
	const task = await fetch(url, {
		method:  'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body:    JSON.stringify(data || {})
	}).then(r => r.json());

	if(!task) {
		return false;
	}

	switch(task.name) {
		case 'Browser.newPage': {
			const tab = await new Promise<chrome.tabs.Tab>(r => chrome.tabs.create({}, r));
			return {
				payload: tab.id
			};
		}
		case 'Browser.pages': {
			const window = await new Promise<chrome.windows.Window>(r => chrome.windows.getLastFocused(r));
			const tabs   = await new Promise<chrome.tabs.Tab[]>(r => chrome.tabs.getAllInWindow(window.id, r as any));
			return {
				payload: tabs.filter(t => typeof t.id === 'number').map(t => t.id)
			};
		}

		case 'Page.goto': {
			await chrome.tabs.update(task.ref, {
				url: task.args[0]
			});
			return {};
		}
		case 'Page.screenshot': {
			const tab = await new Promise<chrome.tabs.Tab | undefined>(r =>
				chrome.tabs.update(task.ref, { active: true }, r)
			);
			if(!tab) {
				return {
					error: `Failed to execute ${task.name}: Tab was not found.`
				};
			}

			const dataURL = await new Promise<string>(r =>
				chrome.tabs.captureVisibleTab(tab.windowId, {
					format:  task.args[0]?.type,
					quality: task.args[0]?.quality
				}, r)
			);
			return {
				payload: dataURL.replace(/^.*?,/, '')
			};
		}
		case 'Page.close': {
			await new Promise(r => setTimeout(r, 1000));
			await chrome.tabs.remove(task.ref);
			return {};
		}
		default: {
			let i = 0, response;
			await new Promise(r => setTimeout(r, 2500));
			while(response === undefined) {
				const tab = await new Promise<chrome.tabs.Tab>(r => chrome.tabs.get(task.ref, r));
				response  = tab.status === 'complete' ? await new Promise(res => {
					chrome.tabs.sendMessage(task.ref, {
						topic:   'execute',
						payload: task
					}, res);
				}) : undefined;

				if(chrome.runtime.lastError) {
					return {};
				}

				if(response === undefined) {
					if(++i === 10) {
						break;
					} else {
						await new Promise(r => setTimeout(r, 500));
					}
				}
			}
			return response;
		}
	}
}

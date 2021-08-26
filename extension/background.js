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
			console.log('10s');
			await new Promise(r => setTimeout(r, 10_000));
		}
	}
}

async function pollTask(data) {
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
			const tab = await new Promise(r => chrome.tabs.create({}, r));
			return {
				payload: {
					id: tab.id
				}
			};
		}
		case 'Page.goto': {
			await chrome.tabs.update(task.ref, {
				url: task.args[0]
			});
			return {};
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
				response = await new Promise(res => {
					chrome.tabs.sendMessage(task.ref, {
						topic:   'execute',
						payload: task
					}, res);
				});
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

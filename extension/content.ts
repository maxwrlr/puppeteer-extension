chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
	if(msg.topic !== 'execute') {
		return;
	}

	const task = msg.payload;
	switch(task.name) {
		case 'Page.click': {
			const element = document.querySelector(task.args[0]);
			if(element) {
				element.click();
				sendResponse();
			} else {
				sendResponse({
					error: 'Failed to execute Page.click: No element found for "' + task.args[0] + '"'
				});
			}
			return;
		}

		case 'Page.evaluate': {
			const div     = document.createElement('div');
			div.innerText = task.args[0];
			document.body.appendChild(div);

			const script = document.createElement('script');
			script.src   = chrome.runtime.getURL('eval.js');
			script.addEventListener('load', () => {
				sendResponse({
					payload: JSON.parse(div.innerText)
				});

				script.remove();
				div.remove();
			});

			document.head.appendChild(script);
			return true;
		}

		case 'Page.waitForNavigation': {
			sendResponse();
			return;
		}

		default: {
			sendResponse({
				error: `${task.name} is not Implemented!`
			});
			return;
		}
	}
});

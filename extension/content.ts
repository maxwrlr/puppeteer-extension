chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
	if(msg.topic !== 'execute') {
		return;
	}

	const task = msg.payload;
	switch(task.name) {
		case 'Page.waitForNavigation': {
			setTimeout(sendResponse, task.args[0].timeout);
			break;
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
			break;
		}
		default: {
			sendResponse({
				error: `${task.name} is not Implemented!`
			});
			break;
		}
	}

	return true;
});

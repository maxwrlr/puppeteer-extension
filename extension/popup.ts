document.addEventListener('DOMContentLoaded', () => {
	chrome.runtime.sendMessage({ topic: '@/polls' }, msg => {
		(document.body.lastElementChild! as HTMLElement).innerText = msg;
	});
});

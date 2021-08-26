document.addEventListener('DOMContentLoaded', () => {
	chrome.runtime.sendMessage({ topic: '@/polls' }, msg => {
		document.body.lastElementChild.innerText = msg;
	});
});

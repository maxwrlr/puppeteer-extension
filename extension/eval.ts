(function() {
	const div     = document.body.lastElementChild! as HTMLElement;
	div.innerText = JSON.stringify(eval(div.innerText));
}());

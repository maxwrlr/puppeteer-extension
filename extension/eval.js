(function() {
	const div     = document.body.lastElementChild;
	div.innerText = JSON.stringify(eval(div.innerText));
}());

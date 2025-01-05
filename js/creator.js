import * as nono from './util/nono-utils.js';

const SG_REGEX = /(?:https?:\/\/)?(?:www\.)?steamgifts\.com\/giveaway\/([a-zA-Z0-9]{5})\//;
        
document.addEventListener("DOMContentLoaded", () => {
    const creationForm = document.getElementById("creationForm");
    const createButton = creationForm.querySelector("button[type='button']");

    createButton.addEventListener("click", createNonogram);
});

function createNonogram() {
	let secretText = document.getElementById("secretText").value;
	const numRows = parseInt(document.getElementById("numRows").value, 10);
	const numCols = parseInt(document.getElementById("numCols").value, 10);

	// Validate numRows and numCols
	if (numRows < 4 || numRows > 25) {
		numRows = 10;
	}
	if (numCols < 4 || numCols > 25) {
		numCols = 10;
	}

	let msgType = 0;
	const sgMatch = secretText.match(SG_REGEX);
	if(sgMatch) {
		msgType = 1;
		secretText = sgMatch[1];
	}

	let id = nono.generateNonogram(numRows, numCols, secretText, msgType);

	const linkCmp = document.getElementById("link");
	linkCmp.innerHTML = '';
	linkCmp.appendChild(getAnchor(nono.getPageURL(id)));
	document.getElementById("linkDiv").style.display = "block";
}

function getAnchor(link, text = null) {
	const anchor = document.createElement('a');
	anchor.setAttribute('href', link);
	anchor.textContent = text || link;
	return anchor;
}

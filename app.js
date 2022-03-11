// Dependencies
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Global Vars
const url = 'https://openstax.org/';
let bookList = [];
let downloadLinkList = [];

const getAvailableBooks = async (url) => {
	console.log('Identifying available books...');

	try {
		const response = await axios.get(
			'https://openstax.org/apps/cms/api/books/?format=json'
		);

		bookList = response.data.books;
		console.log(`Found ${bookList.length} available books...`);
	} catch (error) {
		console.error(error);
	}
};

const getDownloadLinkForAllBooks = async (bookList) => {
	bookList.forEach((bookObj, index) => {
		if (bookObj.high_resolution_pdf_url) {
			downloadLinkList.push({
				name: bookObj.title,
				link: bookObj.high_resolution_pdf_url,
			});
			console.log(
				`Found Download Link (${index + 1}/${bookList.length}) ${
					bookObj.title
				}...`
			);
		} else {
			console.log(
				`No Download available (${index + 1}/${bookList.length}) ${
					bookObj.title
				}...`
			);
		}
	});

	console.log(
		`Found ${downloadLinkList.length}/${bookList.length} books available for download.`
	);
};

const downloadBooks = async (downloadLinkList) => {
	let dir = path.join(`OpenStax`, `OpenStax-${Date.now()}/`);

	console.log(`Building directories "${dir}"...`);

	if (!fs.existsSync('OpenStax')) {
		fs.mkdirSync('OpenStax');
	}

	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}

	console.log(`Writing GoalKicker content to "${dir}"...`);

	for (const [index, book] of downloadLinkList.entries()) {
		let name = `${dir}${book.name}.pdf`;
		let url = book.link;
		let file = fs.createWriteStream(name);

		const response = await axios({
			url,
			method: 'GET',
			responseType: 'stream',
		});

		await response.data.pipe(file);

		console.log(
			`Downloaded File (${index + 1}/${downloadLinkList.length}) ${
				book.name
			}...`
		);
	}

	console.log('Downloaded all files.');
};

(async () => {
	console.log('Starting... ');
	await getAvailableBooks(url);
	await getDownloadLinkForAllBooks(bookList);
	await downloadBooks(downloadLinkList);
	console.log('DONE!\n');
})();

document.addEventListener('DOMContentLoaded', async () => {

	try {

		const ui = await UiExtension.register();
		const extConfig = JSON.parse(ui.extension.config || "{}");
		const options = await ui.dialog.options();
		const values = JSON.parse(options.value);
		let value = values.value? JSON.parse(values.value) : {x:0, y:0};

		let zoomValue = 1;

		const elImage = document.querySelector('[data-image]');
		const elTarget = document.querySelector('[data-target]');
		const elBox = document.querySelector('[data-box]');
		const elBody = document.querySelector('body');
		const elDone = document.querySelector("#done");

		/**
		 * Retrieve the image document
		 */
		async function getImageDocument() {

			const url = extConfig.siteInfo.url.replace("{uuid}", values.uuid);

			const result = await axios.get(url, {
				responseType: "json",
				headers: {
					"Content-Type": "application/json"
				},
				auth: {
					username: extConfig.siteInfo.user,
					password: extConfig.siteInfo.password
				}
			});

			if (!result || !result.data) {
				console.error("Couldn't get the image.");
				return null;
			}


			return result.data.items['hippogallery:original'];
		}


		const img = await getImageDocument();
		const {width, height} = img;
		const imageUrl = img.link.url;

		function zoom(evt) {
			evt.preventDefault();

			zoomValue += evt.deltaY * -0.005;
			zoomValue = Math.min(Math.max(.125, zoomValue), 4);

			drawImage();
			drawTarget();

			return false;
		}


		function targetValues(x, y) {
			
			// center of screen.
			const centerX = (elBox.clientWidth / 2);
			const centerY = (elBox.clientHeight / 2);

			// size of image with zoom factor
			const imgWidth = width * zoomValue;
			const imgHeight = height * zoomValue;

			// where does image start?
			const xStart = (centerX - (imgWidth / 2));
			const yStart = (centerY - (imgHeight / 2));

			const realX = Math.min(xStart + imgWidth, Math.max(xStart, x));
			const realY = Math.min(yStart + imgHeight, Math.max(yStart, y));

			return {
				x: ((realX - centerX) / imgWidth), 
				y: ((realY - centerY) / imgHeight)
			};

		}

		function drawImage() {

			const newWidth = width * zoomValue;
			const newHeight = height * zoomValue;

			elImage.style.left = ((elBox.clientWidth / 2) - (newWidth / 2)) + "px";
			elImage.style.top = ((elBox.clientHeight / 2) - (newHeight / 2)) + "px";
			elImage.style.width = newWidth + "px";
			elImage.style.height = newHeight + "px";
		}


		function drawTarget() {

			// center of screen.
			const centerX = (elBox.clientWidth / 2);
			const centerY = (elBox.clientHeight / 2);

			// size of image with zoom factor
			const imgWidth = width * zoomValue;
			const imgHeight = height * zoomValue;

			const targetX = imgWidth * value.x + centerX;
			const targetY = imgHeight * value.y + centerY;

			elTarget.style.width = (50 * zoomValue) + "px";
			elTarget.style.height = (50 * zoomValue) + "px";
			elTarget.style.borderWidth = (5 * zoomValue) + "px";
			elTarget.style.left = `${targetX - 25 * zoomValue}px`;
			elTarget.style.top = `${targetY - 25 * zoomValue}px`;

		}


		// set the background.
		elImage.src = imageUrl;

		elBox.addEventListener('wheel', zoom);

		elBody.onresize = (evt) => {
			drawImage();
			drawTarget();
		};

		elBox.onclick = (evt) => {
			value = targetValues(evt.clientX, evt.clientY);
			drawTarget();
		};

		elDone.onclick = (evt) => {
			ui.dialog.close(JSON.stringify(value));
		};

		drawImage();
		drawTarget();


	} 
	catch(error) {
		console.error('Failed to register extension:', error.message);
		console.error('- error code:', error.code);
		console.error(error);
	}

});

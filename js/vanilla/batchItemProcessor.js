class BatchProcessorItem {
	constructor(item, resolve, reject, errorHandler) {
		this.attempts = 0;
		this.item = item;
		this.promises = [];
		this.errorHandler = errorHandler;

		this.promise(resolve, reject);
	}

	incrementAttempts() {
		this.attempts++;
	}

	promise(resolve, reject) {
		this.promises.push({
			resolve: resolve,
			reject: reject
		});
	}

	resolve(data) {
		this.promises.forEach((promise) => {
			try {
				promise.resolve(data);
			} catch (e) {
				try {
					promise.reject(e);
				} catch(rejectError) {
					// Super rip.
					this.errorHandler(rejectError);
				}
			}
		});
	}

	reject(err) {
		this.promises.forEach((promise) => {
			try {
				promise.reject(err);
			} catch(rejectError) {
				// Super rip.
				this.errorHandler(rejectError);
			}
		});
	}
}

class BatchItemProcessor {
	constructor(settings, batchProcessor, errorHandler, batchGetter) {
		// batchProcesor is a function that should return a promise
		// errorHandler is a function that should return void (recieves one argument: the error from the batchProcessor reject or individual item reject)
		let defaultSettings = {
			batchSize: 100,
			maxAttempts: 5,
			retryCooldownInMilliseconds: 500,
			deduplicateItems: true,
			processDelay: 0
		};

		this.queue = [];
		this.settings = {};
		this.deduplicationItems = {};
		this.processor = batchProcessor;
		this.errorHandler = errorHandler;
		this.batchGetter = batchGetter || this.getBatch.bind(this);
		this.running = false;

		for (let settingName in defaultSettings) {
			let settingValue = defaultSettings[settingName];
			if (settings.hasOwnProperty(settingName)) {
				settingValue = settings[settingName];
			}

			this.settings[settingName] = settingValue;
		}
	}

	getBatch(queue, batchSize) {
		return queue.slice(0, batchSize);
	}

	push(item) {
		return new Promise((resolve, reject) => {
			let batchProcessorItem;
			let deduplicationKey = null;

			if (this.settings.deduplicateItems) {
				deduplicationKey = this.createDeduplicationKey(item);
				batchProcessorItem = this.deduplicationItems[deduplicationKey];
				if (batchProcessorItem) {
					batchProcessorItem.promise(resolve, reject);
					return;
				}
			}

			batchProcessorItem = new BatchProcessorItem(item, resolve, reject, this.handleError);
			if (deduplicationKey) {
				const deleteDeduplicationItem = () => {
					delete this.deduplicationItems[deduplicationKey];
				};

				this.deduplicationItems[deduplicationKey] = batchProcessorItem;
				batchProcessorItem.promise(deleteDeduplicationItem, deleteDeduplicationItem);
			}

			this.queue.push(batchProcessorItem);

			if (this.settings.processDelay > 0) {
				setTimeout(() => this.process(), this.settings.processDelay);
			} else {
				this.process();
			}
		});
	}

	retry(item) {
		setTimeout(() => {
			this.queue.push(item);
			this.process();
		}, this.settings.retryCooldownInMilliseconds);
	}

	process() {
		if (this.running || this.queue.length <= 0) {
			return;
		}

		this.running = true;
		let processItems = [];
		let batch = this.batchGetter(this.queue, this.settings.batchSize);

		if (batch.length <= 0) {
			return;
		}

		batch.forEach((item) => {
			var index = this.queue.indexOf(item);
			if (index >= 0) {
				this.queue.splice(index, 1);
			}

			item.incrementAttempts();
			processItems.push(item.item);
		});

		this.processor(processItems).then((processResult) => {
			batch.forEach((item) => {
				var processedItem = processResult.find(p => p.item === item.item);

				if (processedItem && processedItem.reject) {
					item.reject(processedItem.reject);
				} else if (processedItem && processedItem.success) {
					item.resolve(processedItem.value);
				} else if (item.attempts < this.settings.maxAttempts) {
					this.retry(item);
				} else {
					item.reject({
						code: BatchItemProcessor.failureCodes.maxAttempts
					});
				}
			});

			this.running = false;
			this.process();
		}).catch((error) => {
			this.handleError(error);

			batch.forEach((item) => {
				if (item.attempts < this.settings.maxAttempts) {
					this.retry(item);
				} else {
					item.reject({
						code: BatchItemProcessor.failureCodes.maxAttempts
					});
				}
			});

			this.running = false;
			this.process();
		});
	}

	handleError(error) {
		if (typeof (this.errorHandler) === "function") {
			try {
				this.errorHandler(error);
			} catch (e) {
				console.error("'errorHandler' failed to handle error", e, error);
			}

			return;
		}

		// Into the void...
	}

	createDeduplicationKey(item) {
		return JSON.stringify(item);
	}
}

BatchItemProcessor.failureCodes = {
	maxAttempts: "maxAttempts"
};

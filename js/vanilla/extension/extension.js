class Extension {
	constructor() {
		this.manifest = chrome.runtime.getManifest();
		this._vars = {
			backgroundPageUrl: this.getUrl(this.manifest.background.page) // To avoid runtime error checking execution context type
		};
	}

	get id() {
		return chrome.runtime.id;
	}

	get name() {
		return this.manifest.name;
	}

	get version() {
		return this.manifest.version;
	}

	get icon() {
		let largestIconSize = 0;
		let largestIcon = "";

		for (let size in this.manifest.icons) {
			if (Number(size) > largestIconSize) {
				largestIconSize = Number(size);
				largestIcon = this.manifest.icons[size];
			}
		}

		if (!largestIcon) {
			return;
		}

		return {
			imageUrl: this.getUrl(largestIcon)
		};
	}

	get executionContextType() {
		if (this.manifest.background && this.manifest.background.page && this._vars.backgroundPageUrl === location.href) {
			return Extension.ExecutionContextTypes.background;
		}

		if (location.protocol.startsWith("chrome-extension")) {
			return Extension.ExecutionContextTypes.browserAction;
		}

		return Extension.ExecutionContextTypes.tab;
	}

	get isIncognito() {
		return chrome.extension.inIncognitoContext;
	}

	getUrl(path) {
		return chrome.extension.getURL(path);
	}
}

Extension.ExecutionContextTypes = {
	"background": "background",
	"tab": "tab",
	"browserAction": "browserAction"
};

Extension.Singleton = new Extension();
console.log(Extension.Singleton.manifest.name + " " + Extension.Singleton.manifest.version + " started" + (Extension.Singleton.isIncognito ? " in icognito" : ""));

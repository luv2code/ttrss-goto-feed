require(["dojo/ready"], function(ready) {
	ready(function() {
		// Only run when App is initialized
		if (typeof App === 'undefined' || !App.hotkey_actions) return;

		App.hotkey_actions["goto_feed"] = () => {
			require(["dijit/form/FilteringSelect", "dojo/store/Memory"], function(FilteringSelect, Memory) {
				const tree = dijit.byId("feedTree");
				if (!tree || !tree.model || !tree.model.store) return;

				const feedItems = [];

				// Since tree.model.store._arrayOfAllItems exists for ItemFileWriteStore, we can just use that
				// which is already flattened and populated!
				if (tree.model.store._arrayOfAllItems) {
					const allItems = tree.model.store._arrayOfAllItems;
					for (let i = 0; i < allItems.length; i++) {
						const item = allItems[i];
						if (!item || !item.id) continue;

						const id = Array.isArray(item.id) ? item.id[0] : item.id;
						if (id === 'root') continue;

						const is_feed = id && id.startsWith('FEED:');
						const is_cat = id && id.startsWith('CAT:');

						if (is_feed || is_cat) {
							feedItems.push({
								id: id,
								name: item.name ? (Array.isArray(item.name) ? item.name[0] : item.name) : "Unknown"
							});
						}
					}
					// Sort feedItems alphabetically by name for consistent behavior
					feedItems.sort((a, b) => a.name.localeCompare(b.name));
				}

				const dialog = new fox.SingleUseDialog({
					title: __("Go to feed"),
					content: `
						<form onsubmit='return false'>
							<section>
								<fieldset>
									<div id="gotoFeed_select_container"></div>
								</fieldset>
							</section>
							<footer>
								<button dojoType='dijit.form.Button' type='submit' class='alt-primary'>
									${__('Go')}
								</button>
								<button dojoType='dijit.form.Button' onclick='App.dialogOf(this).hide()'>
									${__('Cancel')}
								</button>
							</footer>
						</form>
					`
				});

				dialog.show();

				const select = new FilteringSelect({
					store: new Memory({ data: feedItems }),
					searchAttr: "name",
					queryExpr: "*${0}*",
					ignoreCase: true,
					autoComplete: false,
					placeHolder: __("Search for a feed..."),
					style: "width: 100%",
					required: true
				});

				const container = document.getElementById("gotoFeed_select_container");
				container.appendChild(select.domNode);

				select.on("search", () => {
					window.setTimeout(() => {
						if (select.dropDown && select.dropDown.selectFirstNode) {
							select.dropDown.selectFirstNode();
						}
					}, 10);
				});

				window.setTimeout(() => select.focus(), 10);

				const go = (e) => {
					if (e && typeof e.preventDefault === 'function') e.preventDefault();
					let val = select.get("value");

					if (!select.isValid()) {
						const text = select.get("displayedValue");
						if (text) {
							const textLower = text.toLowerCase();
							const match = feedItems.find(item => item.name.toLowerCase().includes(textLower));
							if (match) {
								val = match.id;
							} else {
								val = null;
							}
						}
					}

					if (val) {
						const is_cat = val.match("^CAT:") !== null;
						const feed = val.substr(val.indexOf(":") + 1);
						Feeds.open({ feed: feed, is_cat: is_cat });
						dialog.hide();
					}
				};

				select.on("change", go);
				dialog.domNode.querySelector("form").onsubmit = go;
			});
		};
	});
});

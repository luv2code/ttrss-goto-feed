<?php

class Goto_Feed extends Plugin {
	/**
	 * @param PluginHost $host
	 * @return void
	 */
	function init($host) {
		$host->add_hook($host::HOOK_HOTKEY_MAP, $this);
		$host->add_hook($host::HOOK_HOTKEY_INFO, $this);
	}

	function about() {
		return [1.02,
			"Add gg keyboard shortcut to bring up a dialog to autocomplete and navigate to feeds.",
			"@luv2code https://github.com/luv2code/ttrss-goto-feed",
			false,
		];
	}

	function hook_hotkey_map($hotkeys) {
		$hotkeys["g g"] = "goto_feed";
		return $hotkeys;
	}

	function hook_hotkey_info($hotkeys) {
		$hotkeys[__("Go to")]["goto_feed"] = __("Feed selection dialog");
		return $hotkeys;
	}

	function get_js() {
		return file_get_contents(__DIR__ . "/init.js");
	}

	function api_version() {
		return 2; // Recommended to be 2 for newer plugins
	}
}

?>

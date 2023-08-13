const params = new URLSearchParams(window.location.search);

const file = params.get("debug") === "1" ? "debug" : "index";

window.location.replace(`/${file}.html?page=${encodeURIComponent(window.location.pathname)}${window.location.search ? "&" + window.location.search.slice(1) : ""}`);
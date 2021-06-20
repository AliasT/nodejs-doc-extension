const tmpl = document.createElement("template");
const toc = document.querySelector("#toc");

tmpl.innerHTML = `
	<style>
		:host {
			display: none;
		}

		:host * {
			box-sizing: border-box;
		}

		#search-input {
			position: fixed;
			top: 20px;
			left: 50%;
			transform: translate(-50%);
			width: 600px;
			// padding: 16px;
			border: solid 1px #ccc;
			border-radius: 8px;
			background: aliceblue;
		}

    #search-input-input-container {
      padding: 16px;
      box-shadow: 0px 6px 20px 0px rgb(158 158 158 / 27%);
    }

		#search-input-input {
			display: block;
			width: 100%;
			line-height: 28px;
			font-size: 18px;
		}

		#search-input-results {
			max-height: 600px;
			overflow-y: scroll;
      padding: 16px;
		}

		#search-input-results a {
			display: block;
			padding: 5px 0;
			color: #438562;
		}

		#search-input-results a:hover {
			background: #438562;
			color: #fff;
		}
	</style>

	<div id="search-input">
		<div id="search-input-input-container">
      <input id="search-input-input" />
    </div>
		<div id="search-input-results" tabIndex="1">
		</div>
	</div>


`;

customElements.define(
  "search-input",
  class extends HTMLElement {
    static get observedAttributes() {
      return ["results", "open"];
    }

    constructor() {
      super();
      this.match;
      let shadowRoot = this.attachShadow({
        mode: "open",
        // https://developers.google.com/web/fundamentals/web-components/shadowdom#focus
        delegatesFocus: true,
      });
      shadowRoot.appendChild(tmpl.content.cloneNode(true));
      this.attachEvents();
    }

    set results(val) {
      const results = this.shadowRoot.querySelector("#search-input-results");
      val.forEach((a) => {
        results.appendChild(a.cloneNode(true));
      });
    }

    set open(val) {
      this.style.display = val ? "block" : "none";
      if (val) {
        this.focus();
      }
      document.body.style.overflow = val ? "hidden" : "auto";
    }

    attachEvents() {
      this.shadowRoot.addEventListener("click", (e) => {
        e.stopPropagation();
        if (e.target.tagName === "A") {
          // todo
          this.open = false;
        }
      });

      // esc 隐藏
      this.shadowRoot.addEventListener("keyup", (e) => {
        if (e.code === "Escape") {
          this.open = false;
        }
      });

      document.addEventListener("click", () => {
        this.open = false;
      });

      const input = this.shadowRoot.querySelector("#search-input-input");
      this.input = input;
      // https://developers.google.com/web/fundamentals/web-components/shadowdom#focus
      // Autofocus processing was blocked because a document's URL has a fragment '#fs_dir_readsync'.

      input.addEventListener("input", (e) => {
        // TODO: optimize
        const links = this.shadowRoot.querySelectorAll(
          "#search-input-results a"
        );
        const keywords = input.value;
        links.forEach((a) => {
          if (fuzzysearch(keywords, a.innerText)) {
            a.style.display = "block";
          } else {
            a.style.display = "none";
          }
        });
      });
    }
  }
);
// window.customElements.define("search-input", SearchInput, {
//   extends: "div",
// });

(function init() {
  const searchInput = document.createElement("search-input");
  document.body.appendChild(searchInput);
  const links = toc.querySelectorAll("a");
  searchInput.results = links;
  document.body.addEventListener("keyup", (e) => {
    if (e.code === "KeyS") {
      searchInput.open = true;
    }
  });
})();

var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Lapsa_instances, _Lapsa_rootSelector, _Lapsa_bottomMarginElement, _Lapsa_shelfContainer, _Lapsa_slideShelf, _Lapsa_shelfMargin, _Lapsa_shelfIsOpen, _Lapsa_shelfIsAnimating, _Lapsa_shelfIndicatorContainer, _Lapsa_slideShelfIndicator, _Lapsa_transitionAnimationDistance, _Lapsa_useSearchParams, _Lapsa_startingSlide, _Lapsa_numBuilds, _Lapsa_currentlyAnimating, _Lapsa_inTableView, _Lapsa_handleKeydownEventBound, _Lapsa_handleTouchstartEventBound, _Lapsa_handleTouchmoveEventBound, _Lapsa_handleMousemoveEventBound, _Lapsa_onResizeBound, _Lapsa_currentlyTouchDevice, _Lapsa_lastMousemoveEvent, _Lapsa_lastWindowHeight, _Lapsa_startWindowHeight, _Lapsa_windowHeightAnimationFrame, _Lapsa_windowHeightAnimationLastTimestamp, _Lapsa_resizeAnimationBound, _Lapsa_missedResizeAnimation, _Lapsa_currentlyDragging, _Lapsa_dragDistanceX, _Lapsa_lastTouchX, _Lapsa_dragDistanceY, _Lapsa_lastTouchY, _Lapsa_lastMoveThisDrag, _Lapsa_safeVh, _Lapsa_updateSearchParams, _Lapsa_onResize, _Lapsa_resizeAnimation, _Lapsa_showSlideShelf, _Lapsa_hideSlideShelf, _Lapsa_showSlideShelfIndicator, _Lapsa_hideSlideShelfIndicator, _Lapsa_handleKeydownEvent, _Lapsa_handleTouchstartEvent, _Lapsa_handleTouchmoveEvent, _Lapsa_handleMousemoveEvent;
const defaultOptions = {
    builds: {},
    setupBuild: (data) => { },
    transitionAnimationTime: 150,
    transitionAnimationDistanceFactor: .015,
    tableViewAnimationTime: 600,
    shelfAnimationTime: 275,
    slideAnimateInEasing: "cubic-bezier(.4, 1.0, .7, 1.0)",
    slideAnimateOutEasing: "cubic-bezier(.1, 0.0, .2, 0.0)",
    buildAnimateInEasing: "cubic-bezier(.4, 1.0, .7, 1.0)",
    buildAnimateOutEasing: "cubic-bezier(.1, 0.0, .2, 0.0)",
    shelfAnimateInEasing: "cubic-bezier(.4, 1.0, .7, 1.0)",
    shelfAnimateOutEasing: "cubic-bezier(.4, 0.0, .4, 1.0)",
    tableViewEasing: "cubic-bezier(.25, 1.0, .5, 1.0)",
    appendHTML: "",
    useSearchParams: true,
    startingSlide: 0,
    tableViewSlidesPerScreen: 4,
    useShelf: true,
    useShelfIndicator: true,
    permanentShelf: false,
    shelfIconPaths: "/icons/",
    resizeOnTableView: false,
    windowHeightAnimationFrames: 8,
    dragDistanceThreshhold: 10
};
class Lapsa {
    constructor(inputOptions) {
        _Lapsa_instances.add(this);
        this.currentSlide = -1;
        this.buildState = 0;
        _Lapsa_rootSelector.set(this, void 0);
        _Lapsa_bottomMarginElement.set(this, void 0);
        _Lapsa_shelfContainer.set(this, void 0);
        _Lapsa_slideShelf.set(this, void 0);
        _Lapsa_shelfMargin.set(this, 15);
        _Lapsa_shelfIsOpen.set(this, false);
        _Lapsa_shelfIsAnimating.set(this, false);
        _Lapsa_shelfIndicatorContainer.set(this, void 0);
        _Lapsa_slideShelfIndicator.set(this, void 0);
        _Lapsa_transitionAnimationDistance.set(this, 0);
        _Lapsa_useSearchParams.set(this, void 0);
        _Lapsa_startingSlide.set(this, 0);
        _Lapsa_numBuilds.set(this, []);
        _Lapsa_currentlyAnimating.set(this, false);
        _Lapsa_inTableView.set(this, false);
        _Lapsa_handleKeydownEventBound.set(this, void 0);
        _Lapsa_handleTouchstartEventBound.set(this, void 0);
        _Lapsa_handleTouchmoveEventBound.set(this, void 0);
        _Lapsa_handleMousemoveEventBound.set(this, void 0);
        _Lapsa_onResizeBound.set(this, void 0);
        _Lapsa_currentlyTouchDevice.set(this, false);
        _Lapsa_lastMousemoveEvent.set(this, 0);
        _Lapsa_lastWindowHeight.set(this, window.innerHeight);
        _Lapsa_startWindowHeight.set(this, window.innerHeight);
        _Lapsa_windowHeightAnimationFrame.set(this, 0);
        _Lapsa_windowHeightAnimationLastTimestamp.set(this, -1);
        _Lapsa_resizeAnimationBound.set(this, void 0);
        _Lapsa_missedResizeAnimation.set(this, false);
        _Lapsa_currentlyDragging.set(this, false);
        _Lapsa_dragDistanceX.set(this, 0);
        _Lapsa_lastTouchX.set(this, -1);
        _Lapsa_dragDistanceY.set(this, 0);
        _Lapsa_lastTouchY.set(this, -1);
        _Lapsa_lastMoveThisDrag.set(this, 0);
        _Lapsa_safeVh.set(this, window.innerHeight / 100);
        const options = {
            ...defaultOptions,
            ...inputOptions,
        };
        this.callbacks = options.builds;
        this.setupBuild = options.setupBuild;
        this.transitionAnimationTime = options.transitionAnimationTime;
        this.transitionAnimationDistanceFactor = options.transitionAnimationDistanceFactor;
        this.tableViewAnimationTime = options.tableViewAnimationTime;
        this.shelfAnimationTime = options.shelfAnimationTime;
        this.resizeOnTableView = options.resizeOnTableView;
        this.windowHeightAnimationFrames = options.windowHeightAnimationFrames;
        __classPrivateFieldSet(this, _Lapsa_useSearchParams, options.useSearchParams, "f");
        const params = new URLSearchParams(window.location.search);
        const startingSlide = __classPrivateFieldGet(this, _Lapsa_useSearchParams, "f") ? params.get("slide") : null;
        __classPrivateFieldSet(this, _Lapsa_startingSlide, startingSlide ? parseInt(startingSlide) : options.startingSlide, "f");
        this.tableViewSlidesPerScreen = options.tableViewSlidesPerScreen;
        this.useShelf = options.useShelf;
        this.useShelfIndicator = options.useShelfIndicator;
        this.permanentShelf = options.permanentShelf;
        this.shelfIconPaths = options.shelfIconPaths;
        if (typeof this.shelfIconPaths === "string") {
            if (this.shelfIconPaths.length >= 1
                && this.shelfIconPaths[this.shelfIconPaths.length - 1] !== "/") {
                this.shelfIconPaths = `${this.shelfIconPaths}/`;
            }
            this.shelfIconPaths = [
                `${this.shelfIconPaths}up-2.png`,
                `${this.shelfIconPaths}up-1.png`,
                `${this.shelfIconPaths}table.png`,
                `${this.shelfIconPaths}down-1.png`,
                `${this.shelfIconPaths}down-2.png`,
                `${this.shelfIconPaths}shelf-indicator.png`
            ];
        }
        if (this.shelfIconPaths.length < 5 && this.useShelf) {
            throw new Error("[Lapsa] Not enough shelf icons provided!");
        }
        if (this.shelfIconPaths.length < 6 && this.useShelfIndicator) {
            throw new Error("[Lapsa] No shelf indicator icon provided!");
        }
        this.slideAnimateInEasing = options.slideAnimateInEasing;
        this.slideAnimateOutEasing = options.slideAnimateOutEasing;
        this.buildAnimateInEasing = options.buildAnimateInEasing;
        this.buildAnimateOutEasing = options.buildAnimateOutEasing;
        this.shelfAnimateInEasing = options.shelfAnimateInEasing;
        this.shelfAnimateOutEasing = options.shelfAnimateOutEasing;
        this.tableViewEasing = options.tableViewEasing;
        this.appendHTML = options.appendHTML;
        this.dragDistanceThreshhold = options.dragDistanceThreshhold;
        const rootElement = document.querySelector(":root");
        if (!rootElement) {
            throw new Error("[Lapsa] Root element doesn't exist");
        }
        __classPrivateFieldSet(this, _Lapsa_rootSelector, rootElement, "f");
        __classPrivateFieldSet(this, _Lapsa_resizeAnimationBound, __classPrivateFieldGet(this, _Lapsa_instances, "m", _Lapsa_resizeAnimation).bind(this), "f");
        const slideContainerElement = document.body.querySelector("#lapsa-slide-container");
        if (!slideContainerElement) {
            throw new Error("[Lapsa] Slide container element doesn't exist");
        }
        this.slideContainer = slideContainerElement;
        this.slideContainer.classList.add("lapsa-hover");
        this.slides = document.body.querySelectorAll("#lapsa-slide-container > *");
        if (Number.isNaN(__classPrivateFieldGet(this, _Lapsa_startingSlide, "f")) || __classPrivateFieldGet(this, _Lapsa_startingSlide, "f") < 0 || __classPrivateFieldGet(this, _Lapsa_startingSlide, "f") >= this.slides.length) {
            __classPrivateFieldSet(this, _Lapsa_startingSlide, 0, "f");
        }
        __classPrivateFieldSet(this, _Lapsa_bottomMarginElement, document.createElement("div"), "f");
        __classPrivateFieldGet(this, _Lapsa_bottomMarginElement, "f").id = "lapsa-bottom-margin";
        this.slideContainer.appendChild(__classPrivateFieldGet(this, _Lapsa_bottomMarginElement, "f"));
        __classPrivateFieldSet(this, _Lapsa_numBuilds, new Array(this.slides.length), "f");
        this.slides.forEach((element, index) => {
            var _a, _b;
            element.classList.add("lapsa-slide");
            const wrapper = document.createElement("div");
            wrapper.classList.add("lapsa-slide-wrapper");
            wrapper.style.top = window.innerWidth / window.innerHeight >= 152 / 89 ? `calc(${index * 100 + 2.5} * var(--safe-vh))` : `calc(${index * 100} * var(--safe-vh) + (100 * var(--safe-vh) - 55.625vw) / 2)`;
            this.slideContainer.insertBefore(wrapper, element);
            wrapper.appendChild(element);
            if (element.lastElementChild) {
                element.lastElementChild.insertAdjacentHTML("afterend", this.appendHTML);
            }
            else {
                element.innerHTML = this.appendHTML;
            }
            element.addEventListener("click", () => {
                if (!__classPrivateFieldGet(this, _Lapsa_inTableView, "f")) {
                    return;
                }
                this.closeTableView(index);
            });
            element.addEventListener("touchstart", __classPrivateFieldGet(this, _Lapsa_instances, "m", _Lapsa_handleTouchstartEvent).bind(this));
            element.addEventListener("touchmove", __classPrivateFieldGet(this, _Lapsa_instances, "m", _Lapsa_handleTouchmoveEvent).bind(this));
            const builds = element.querySelectorAll(".build, [data-build]");
            let currentBuild = 0;
            __classPrivateFieldGet(this, _Lapsa_numBuilds, "f")[index] = 0;
            builds.forEach(buildElement => {
                const attr = buildElement.getAttribute("data-build");
                if (attr === null) {
                    buildElement.setAttribute("data-build", currentBuild.toString());
                    currentBuild++;
                }
                else {
                    currentBuild = parseInt(attr) + 1;
                }
                __classPrivateFieldGet(this, _Lapsa_numBuilds, "f")[index] = Math.max(__classPrivateFieldGet(this, _Lapsa_numBuilds, "f")[index], currentBuild);
                buildElement.classList.remove("build");
            });
            const functionalBuildKeys = Object.keys((_b = (_a = this.callbacks) === null || _a === void 0 ? void 0 : _a[element.id]) !== null && _b !== void 0 ? _b : {});
            let maxFunctionalBuild = 0;
            functionalBuildKeys.forEach(key => maxFunctionalBuild = Math.max(maxFunctionalBuild, (parseInt(key) + 1) || 0));
            __classPrivateFieldGet(this, _Lapsa_numBuilds, "f")[index] = Math.max(__classPrivateFieldGet(this, _Lapsa_numBuilds, "f")[index], maxFunctionalBuild);
        });
        __classPrivateFieldSet(this, _Lapsa_transitionAnimationDistance, window.innerWidth / window.innerHeight >= 152 / 89
            ? window.innerHeight * this.transitionAnimationDistanceFactor * 159 / 82
            : window.innerWidth * this.transitionAnimationDistanceFactor, "f");
        __classPrivateFieldSet(this, _Lapsa_safeVh, window.innerHeight / 100, "f");
        __classPrivateFieldGet(this, _Lapsa_rootSelector, "f").style.setProperty("--safe-vh", `${__classPrivateFieldGet(this, _Lapsa_safeVh, "f")}px`);
        __classPrivateFieldSet(this, _Lapsa_shelfContainer, document.createElement("div"), "f");
        __classPrivateFieldGet(this, _Lapsa_shelfContainer, "f").id = "lapsa-slide-shelf-container";
        __classPrivateFieldGet(this, _Lapsa_shelfContainer, "f").innerHTML = /* html */ `
			<div id="lapsa-slide-shelf" class="lapsa-hover lapsa-interactable" style="margin-left: ${-__classPrivateFieldGet(this, _Lapsa_shelfMargin, "f")}px; opacity: 0">
				<input type="image" id="lapsa-up-2-button" class="shelf-button lapsa-interactable" src="${this.shelfIconPaths[0]}">
				<input type="image" id="lapsa-up-1-button" class="shelf-button lapsa-interactable" src="${this.shelfIconPaths[1]}">
				<input type="image" id="lapsa-table-button" class="shelf-button lapsa-interactable" src="${this.shelfIconPaths[2]}">
				<input type="image" id="lapsa-down-1-button" class="shelf-button lapsa-interactable" src="${this.shelfIconPaths[3]}">
				<input type="image" id="lapsa-down-2-button" class="shelf-button lapsa-interactable" src="${this.shelfIconPaths[4]}">
			</div>
		`;
        document.body.appendChild(__classPrivateFieldGet(this, _Lapsa_shelfContainer, "f"));
        __classPrivateFieldSet(this, _Lapsa_shelfIndicatorContainer, document.createElement("div"), "f");
        __classPrivateFieldGet(this, _Lapsa_shelfIndicatorContainer, "f").id = "lapsa-slide-shelf-indicator-container";
        if (this.useShelfIndicator) {
            __classPrivateFieldGet(this, _Lapsa_shelfIndicatorContainer, "f").innerHTML = /* html */ `<img id="lapsa-slide-shelf-indicator" src="${this.shelfIconPaths[5]}"></img>`;
        }
        document.body.appendChild(__classPrivateFieldGet(this, _Lapsa_shelfIndicatorContainer, "f"));
        if ("scrollRestoration" in history) {
            history.scrollRestoration = "manual";
        }
        setTimeout(() => window.scrollTo(0, 0), 10);
        const slideShelfElement = document.querySelector("#lapsa-slide-shelf");
        if (!slideShelfElement) {
            throw new Error("[Lapsa] Slide shelf element doesn't exist");
        }
        __classPrivateFieldSet(this, _Lapsa_slideShelf, slideShelfElement, "f");
        if (this.useShelfIndicator) {
            const slideShelfIndicatorElement = document.querySelector("#lapsa-slide-shelf-indicator");
            if (!slideShelfIndicatorElement) {
                throw new Error("[Lapsa] Slide shelf indicator element doesn't exist");
            }
            __classPrivateFieldSet(this, _Lapsa_slideShelfIndicator, slideShelfIndicatorElement, "f");
            if (this.permanentShelf) {
                __classPrivateFieldGet(this, _Lapsa_slideShelfIndicator, "f").style.display = "none";
            }
        }
        if (this.permanentShelf) {
            __classPrivateFieldGet(this, _Lapsa_shelfContainer, "f").classList.add("permanent-shelf");
            __classPrivateFieldGet(this, _Lapsa_instances, "m", _Lapsa_showSlideShelf).call(this, __classPrivateFieldGet(this, _Lapsa_slideShelf, "f"));
            __classPrivateFieldSet(this, _Lapsa_shelfIsAnimating, false, "f");
            __classPrivateFieldSet(this, _Lapsa_shelfIsOpen, true, "f");
        }
        else {
            __classPrivateFieldGet(this, _Lapsa_instances, "m", _Lapsa_hideSlideShelf).call(this, __classPrivateFieldGet(this, _Lapsa_slideShelf, "f"), 0);
        }
        __classPrivateFieldGet(this, _Lapsa_shelfContainer, "f").addEventListener("mouseenter", () => {
            if (!__classPrivateFieldGet(this, _Lapsa_shelfIsOpen, "f") && !this.permanentShelf && this.useShelf) {
                this.showShelf();
            }
        });
        __classPrivateFieldGet(this, _Lapsa_shelfContainer, "f").addEventListener("mouseleave", () => {
            if (__classPrivateFieldGet(this, _Lapsa_shelfIsOpen, "f") && !this.permanentShelf && this.useShelf) {
                this.hideShelf();
            }
        });
        __classPrivateFieldGet(this, _Lapsa_slideShelf, "f").children[0].addEventListener("click", () => {
            if (__classPrivateFieldGet(this, _Lapsa_shelfIsOpen, "f") && !__classPrivateFieldGet(this, _Lapsa_shelfIsAnimating, "f")) {
                this.previousSlide(true);
            }
        });
        __classPrivateFieldGet(this, _Lapsa_slideShelf, "f").children[1].addEventListener("click", () => {
            if (__classPrivateFieldGet(this, _Lapsa_shelfIsOpen, "f") && !__classPrivateFieldGet(this, _Lapsa_shelfIsAnimating, "f")) {
                this.previousSlide();
            }
        });
        __classPrivateFieldGet(this, _Lapsa_slideShelf, "f").children[2].addEventListener("click", () => {
            if (__classPrivateFieldGet(this, _Lapsa_shelfIsOpen, "f") && !__classPrivateFieldGet(this, _Lapsa_shelfIsAnimating, "f")) {
                if (__classPrivateFieldGet(this, _Lapsa_inTableView, "f")) {
                    this.closeTableView(this.currentSlide);
                }
                else {
                    this.openTableView();
                }
            }
        });
        __classPrivateFieldGet(this, _Lapsa_slideShelf, "f").children[3].addEventListener("click", () => {
            if (__classPrivateFieldGet(this, _Lapsa_shelfIsOpen, "f") && !__classPrivateFieldGet(this, _Lapsa_shelfIsAnimating, "f")) {
                this.nextSlide();
            }
        });
        __classPrivateFieldGet(this, _Lapsa_slideShelf, "f").children[4].addEventListener("click", () => {
            if (__classPrivateFieldGet(this, _Lapsa_shelfIsOpen, "f") && !__classPrivateFieldGet(this, _Lapsa_shelfIsAnimating, "f")) {
                this.nextSlide(true);
            }
        });
        document.documentElement.style.overflowY = "hidden";
        document.body.style.overflowY = "hidden";
        document.body.style.userSelect = "none";
        __classPrivateFieldSet(this, _Lapsa_handleKeydownEventBound, __classPrivateFieldGet(this, _Lapsa_instances, "m", _Lapsa_handleKeydownEvent).bind(this), "f");
        __classPrivateFieldSet(this, _Lapsa_handleTouchstartEventBound, __classPrivateFieldGet(this, _Lapsa_instances, "m", _Lapsa_handleTouchstartEvent).bind(this), "f");
        __classPrivateFieldSet(this, _Lapsa_handleTouchmoveEventBound, __classPrivateFieldGet(this, _Lapsa_instances, "m", _Lapsa_handleTouchmoveEvent).bind(this), "f");
        __classPrivateFieldSet(this, _Lapsa_handleMousemoveEventBound, __classPrivateFieldGet(this, _Lapsa_instances, "m", _Lapsa_handleMousemoveEvent).bind(this), "f");
        __classPrivateFieldSet(this, _Lapsa_onResizeBound, __classPrivateFieldGet(this, _Lapsa_instances, "m", _Lapsa_onResize).bind(this), "f");
        document.documentElement.addEventListener("keydown", __classPrivateFieldGet(this, _Lapsa_handleKeydownEventBound, "f"));
        document.documentElement.addEventListener("touchstart", __classPrivateFieldGet(this, _Lapsa_handleTouchstartEventBound, "f"));
        document.documentElement.addEventListener("touchmove", __classPrivateFieldGet(this, _Lapsa_handleTouchmoveEventBound, "f"));
        document.documentElement.addEventListener("mousemove", __classPrivateFieldGet(this, _Lapsa_handleMousemoveEventBound, "f"));
        window.addEventListener("resize", __classPrivateFieldGet(this, _Lapsa_onResizeBound, "f"));
        setTimeout(() => this.jumpToSlide(__classPrivateFieldGet(this, _Lapsa_startingSlide, "f")), 500);
    }
    exit() {
        this.slideContainer.remove();
        __classPrivateFieldGet(this, _Lapsa_shelfContainer, "f").remove();
        __classPrivateFieldGet(this, _Lapsa_shelfIndicatorContainer, "f").remove();
        this.slides.forEach(element => element.remove());
        document.documentElement.style.overflowY = "visible";
        document.body.style.overflowY = "visible";
        document.body.style.height = "fit-content";
        document.body.style.userSelect = "auto";
        document.documentElement.removeEventListener("keydown", __classPrivateFieldGet(this, _Lapsa_handleKeydownEventBound, "f"));
        document.documentElement.removeEventListener("touchstart", __classPrivateFieldGet(this, _Lapsa_handleTouchstartEventBound, "f"));
        document.documentElement.removeEventListener("touchmove", __classPrivateFieldGet(this, _Lapsa_handleTouchmoveEventBound, "f"));
        document.documentElement.removeEventListener("mousemove", __classPrivateFieldGet(this, _Lapsa_handleMousemoveEventBound, "f"));
        window.removeEventListener("resize", __classPrivateFieldGet(this, _Lapsa_onResizeBound, "f"));
    }
    async nextSlide(skipBuilds = false) {
        if (__classPrivateFieldGet(this, _Lapsa_currentlyAnimating, "f") || __classPrivateFieldGet(this, _Lapsa_inTableView, "f")) {
            return;
        }
        __classPrivateFieldSet(this, _Lapsa_currentlyAnimating, true, "f");
        // If there's a build available, we do that instead of moving to the next slide.
        if (this.currentSlide >= 0
            && !skipBuilds && __classPrivateFieldGet(this, _Lapsa_numBuilds, "f")[this.currentSlide] !== 0
            && this.buildState !== __classPrivateFieldGet(this, _Lapsa_numBuilds, "f")[this.currentSlide]) {
            const promises = [];
            // Gross code because animation durations are weird as hell --
            // see the corresponding previousSlide block for a better example.
            this.slides[this.currentSlide]
                .querySelectorAll(`[data-build="${this.buildState}"]`)
                .forEach(element => {
                this.buildIn(element, this.transitionAnimationTime * 2);
                promises.push(new Promise(resolve => setTimeout(resolve, this.transitionAnimationTime)));
            });
            const callbacks = this.callbacks[this.slides[this.currentSlide].id];
            const callback = callbacks ? callbacks[this.buildState] : undefined;
            if (callback) {
                promises.push(callback({
                    lapsa: this,
                    slide: this.slides[this.currentSlide],
                    forward: true
                }));
            }
            await Promise.all(promises);
            this.buildState++;
            __classPrivateFieldSet(this, _Lapsa_currentlyAnimating, false, "f");
            return;
        }
        if (this.currentSlide === this.slides.length - 1) {
            __classPrivateFieldSet(this, _Lapsa_currentlyAnimating, false, "f");
            return;
        }
        // Fade out the current slide, show all its builds (for the table view),
        // then load in the next slide and hide all of its builds.
        await this.fadeUpOut(this.slideContainer, this.transitionAnimationTime);
        // Reset the slide if necessary.
        if (this.currentSlide >= 0 && this.buildState !== __classPrivateFieldGet(this, _Lapsa_numBuilds, "f")[this.currentSlide]) {
            const callbacks = this.callbacks[this.slides[this.currentSlide].id];
            const callback = callbacks === null || callbacks === void 0 ? void 0 : callbacks.reset;
            if (callback) {
                await callback({
                    lapsa: this,
                    slide: this.slides[this.currentSlide],
                    forward: true,
                    duration: 0
                });
            }
            this.slides[this.currentSlide].querySelectorAll("[data-build]")
                .forEach(element => element.style.opacity = "1");
        }
        this.currentSlide++;
        __classPrivateFieldGet(this, _Lapsa_instances, "m", _Lapsa_updateSearchParams).call(this);
        this.buildState = 0;
        const callbacks = this.callbacks[this.slides[this.currentSlide].id];
        this.setupBuild({
            lapsa: this,
            slide: this.slides[this.currentSlide],
            forward: true,
        });
        const callback = callbacks === null || callbacks === void 0 ? void 0 : callbacks.reset;
        if (callback) {
            await callback({
                lapsa: this,
                slide: this.slides[this.currentSlide],
                forward: true,
                duration: 0
            });
        }
        this.slides[this.currentSlide].querySelectorAll("[data-build]")
            .forEach(element => element.style.opacity = "0");
        this.slideContainer.style.transform = `matrix(1, 0, 0, 1, 0, ${-100 * this.currentSlide * __classPrivateFieldGet(this, _Lapsa_safeVh, "f")})`;
        await this.fadeUpIn(this.slideContainer, this.transitionAnimationTime * 2);
        __classPrivateFieldSet(this, _Lapsa_currentlyAnimating, false, "f");
    }
    async previousSlide(skipBuilds = false) {
        if (__classPrivateFieldGet(this, _Lapsa_currentlyAnimating, "f") || __classPrivateFieldGet(this, _Lapsa_inTableView, "f")) {
            return;
        }
        __classPrivateFieldSet(this, _Lapsa_currentlyAnimating, true, "f");
        // If there's a build available, we do that instead of moving to the previous slide.
        if (!skipBuilds && __classPrivateFieldGet(this, _Lapsa_numBuilds, "f")[this.currentSlide] !== 0 && this.buildState !== 0) {
            this.buildState--;
            const promises = Array.from(this.slides[this.currentSlide]
                .querySelectorAll(`[data-build="${this.buildState}"]`))
                .map(element => this.buildOut(element, this.transitionAnimationTime));
            const callbacks = this.callbacks[this.slides[this.currentSlide].id];
            const callback = callbacks ? callbacks[this.buildState] : undefined;
            if (callback) {
                await callback({
                    lapsa: this,
                    slide: this.slides[this.currentSlide],
                    forward: false
                });
            }
            await Promise.all(promises);
            __classPrivateFieldSet(this, _Lapsa_currentlyAnimating, false, "f");
            return;
        }
        if (this.currentSlide === 0 || this.currentSlide === this.slides.length) {
            __classPrivateFieldSet(this, _Lapsa_currentlyAnimating, false, "f");
            return;
        }
        // Fade out the current slide, show all its builds (for the table view),
        // then load in the previous slide and show all of its builds.
        await this.fadeDownOut(this.slideContainer, this.transitionAnimationTime);
        // Reset the slide if necessary.
        if (this.buildState !== __classPrivateFieldGet(this, _Lapsa_numBuilds, "f")[this.currentSlide]) {
            const callbacks = this.callbacks[this.slides[this.currentSlide].id];
            const callback = callbacks === null || callbacks === void 0 ? void 0 : callbacks.reset;
            if (callback) {
                await callback({
                    lapsa: this,
                    slide: this.slides[this.currentSlide],
                    forward: false,
                    duration: 0
                });
            }
            this.slides[this.currentSlide].querySelectorAll("[data-build]")
                .forEach(element => element.style.opacity = "1");
        }
        this.currentSlide--;
        __classPrivateFieldGet(this, _Lapsa_instances, "m", _Lapsa_updateSearchParams).call(this);
        this.buildState = __classPrivateFieldGet(this, _Lapsa_numBuilds, "f")[this.currentSlide];
        const callbacks = this.callbacks[this.slides[this.currentSlide].id];
        this.setupBuild({
            lapsa: this,
            slide: this.slides[this.currentSlide],
            forward: false,
        });
        const callback = callbacks === null || callbacks === void 0 ? void 0 : callbacks.reset;
        if (callback) {
            await callback({
                lapsa: this,
                slide: this.slides[this.currentSlide],
                forward: false,
                duration: 0
            });
        }
        this.slides[this.currentSlide].querySelectorAll("[data-build]")
            .forEach(element => element.style.opacity = "1");
        this.slideContainer.style.transform = `matrix(1, 0, 0, 1, 0, ${-100 * this.currentSlide * __classPrivateFieldGet(this, _Lapsa_safeVh, "f")})`;
        await this.fadeDownIn(this.slideContainer, this.transitionAnimationTime * 2);
        __classPrivateFieldSet(this, _Lapsa_currentlyAnimating, false, "f");
    }
    async jumpToSlide(index) {
        if (__classPrivateFieldGet(this, _Lapsa_currentlyAnimating, "f") || __classPrivateFieldGet(this, _Lapsa_inTableView, "f")) {
            return;
        }
        __classPrivateFieldSet(this, _Lapsa_currentlyAnimating, true, "f");
        if (index < 0 || index >= this.slides.length || index === this.currentSlide) {
            __classPrivateFieldSet(this, _Lapsa_currentlyAnimating, false, "f");
            return;
        }
        const forwardAnimation = index > this.currentSlide;
        if (forwardAnimation) {
            await this.fadeUpOut(this.slideContainer, this.transitionAnimationTime);
        }
        else {
            await this.fadeDownOut(this.slideContainer, this.transitionAnimationTime);
        }
        // Reset the slide if necessary.
        if (this.currentSlide !== -1 && this.buildState !== __classPrivateFieldGet(this, _Lapsa_numBuilds, "f")[this.currentSlide]) {
            const callbacks = this.callbacks[this.slides[this.currentSlide].id];
            const callback = callbacks === null || callbacks === void 0 ? void 0 : callbacks.reset;
            if (callback) {
                await callback({
                    lapsa: this,
                    slide: this.slides[this.currentSlide],
                    forward: false,
                    duration: 0
                });
            }
            this.slides[this.currentSlide].querySelectorAll("[data-build]")
                .forEach(element => element.style.opacity = "1");
        }
        this.currentSlide = index;
        __classPrivateFieldGet(this, _Lapsa_instances, "m", _Lapsa_updateSearchParams).call(this);
        this.buildState = 0;
        const callbacks = this.callbacks[this.slides[this.currentSlide].id];
        this.setupBuild({
            lapsa: this,
            slide: this.slides[this.currentSlide],
            forward: true,
        });
        const callback = callbacks === null || callbacks === void 0 ? void 0 : callbacks.reset;
        if (callback) {
            await callback({
                lapsa: this,
                slide: this.slides[this.currentSlide],
                forward: true,
                duration: 0
            });
        }
        this.slides[this.currentSlide].querySelectorAll("[data-build]")
            .forEach(element => element.style.opacity = "0");
        this.slideContainer.style.transform = `matrix(1, 0, 0, 1, 0, ${-100 * this.currentSlide * __classPrivateFieldGet(this, _Lapsa_safeVh, "f")})`;
        if (forwardAnimation) {
            await this.fadeUpIn(this.slideContainer, this.transitionAnimationTime * 2);
        }
        else {
            await this.fadeDownIn(this.slideContainer, this.transitionAnimationTime * 2);
        }
        __classPrivateFieldSet(this, _Lapsa_currentlyAnimating, false, "f");
    }
    async openTableView(duration = this.tableViewAnimationTime) {
        if (__classPrivateFieldGet(this, _Lapsa_inTableView, "f") || __classPrivateFieldGet(this, _Lapsa_currentlyAnimating, "f")) {
            return;
        }
        __classPrivateFieldSet(this, _Lapsa_currentlyAnimating, true, "f");
        if (__classPrivateFieldGet(this, _Lapsa_currentlyTouchDevice, "f")) {
            this.hideShelf();
        }
        document.body.style.overflowY = "visible";
        document.body.style.position = "relative";
        this.slideContainer.style.overflowY = "visible";
        const bodyRect = document.body.getBoundingClientRect();
        // The goal is to have room to display just under 4 slides vertically,
        // then center on one so that the others are clipped, indicating it's scrollable.
        // In a horizontal orientation, exactly one slide fits per screen.
        // In a vertical one, we take a ratio.
        const slidesPerScreen = bodyRect.width / bodyRect.height >= 152 / 89
            ? 1
            : bodyRect.height / (bodyRect.width * 89 / 152);
        const scale = Math.min(slidesPerScreen / this.tableViewSlidesPerScreen, 1);
        const scaledSlidesPerScreen = slidesPerScreen / scale;
        // The first and last two slides have different animations since
        // they can't be in the middle of the screen in the table view.
        const centerSlide = (() => {
            if (this.currentSlide < (scaledSlidesPerScreen - 1) / 2) {
                return (scaledSlidesPerScreen - 1) / 2;
            }
            if (this.currentSlide > this.slides.length - 1 - (scaledSlidesPerScreen - 1) / 2) {
                return this.slides.length - 1 - (scaledSlidesPerScreen - 1) / 2;
            }
            return this.currentSlide;
        })();
        this.slideContainer.style.transformOrigin = `center calc(${this.currentSlide * 100 + 50} * var(--safe-vh))`;
        const translation = bodyRect.width / bodyRect.height >= 152 / 89
            ? (58.125 * 152 / 89 * centerSlide - 100 * centerSlide) * scale * __classPrivateFieldGet(this, _Lapsa_safeVh, "f")
            : (58.125 * centerSlide) * scale * window.innerWidth / 100
                - 100 * centerSlide * scale * __classPrivateFieldGet(this, _Lapsa_safeVh, "f");
        this.slideContainer.style.transition = `transform ${duration}ms ${this.tableViewEasing}`;
        this.slideContainer.style.transform = bodyRect.width / bodyRect.height >= 152 / 89
            ? `matrix(${scale}, 0, 0, ${scale}, 0, ${((this.currentSlide - centerSlide) * 58.125 * 152 / 89 * scale - 100 * this.currentSlide) * __classPrivateFieldGet(this, _Lapsa_safeVh, "f")})`
            : `matrix(${scale}, 0, 0, ${scale}, 0, ${(this.currentSlide - centerSlide) * 58.125 * scale * window.innerWidth / 100 - 100 * this.currentSlide * __classPrivateFieldGet(this, _Lapsa_safeVh, "f")})`;
        this.slides.forEach((element, index) => {
            if (!element.parentElement) {
                return;
            }
            element.parentElement.style.transition = `top ${duration}ms ${this.tableViewEasing}`;
            // On these, we include the top margin term to match with how
            // things were before -- otherwise, the transformation center will be misaligned.
            if (bodyRect.width / bodyRect.height >= 152 / 89) {
                element.parentElement.style.top = `calc(${58.125 * 152 / 89 * (index - this.currentSlide) + 100 * this.currentSlide + 2.5} * var(--safe-vh))`;
            }
            else {
                element.parentElement.style.top = `calc(${58.125 * (index - this.currentSlide)}vw + ${100 * this.currentSlide} * var(--safe-vh) + (100 * var(--safe-vh) - 55.625vw) / 2)`;
            }
        });
        // While all the slides are moving, we also show all builds that are
        // currently hidden and request that the slide be reset to its final state.
        if (this.buildState !== __classPrivateFieldGet(this, _Lapsa_numBuilds, "f")[this.currentSlide]) {
            const builds = this.slides[this.currentSlide]
                .querySelectorAll("[data-build]");
            const oldTransitionStyles = new Array(builds.length);
            builds.forEach((element, index) => {
                oldTransitionStyles[index] = element.style.transition;
                element.style.transition = `opacity ${duration / 2}ms ${this.slideAnimateOutEasing}`;
                element.style.opacity = "1";
            });
            // We don't await this one because we want it to run concurrently
            // with the table view animation.
            const callbacks = this.callbacks[this.slides[this.currentSlide].id];
            const callback = callbacks === null || callbacks === void 0 ? void 0 : callbacks.reset;
            if (callback) {
                callback({
                    lapsa: this,
                    slide: this.slides[this.currentSlide],
                    forward: false,
                    duration: duration / 2
                });
            }
            setTimeout(() => {
                builds.forEach((element, index) => {
                    element.style.transition = oldTransitionStyles[index];
                });
            }, duration / 2);
        }
        // Only once this is done can we snap to the end. They'll never know the difference!
        await new Promise(resolve => {
            setTimeout(() => {
                const correctTop = this.slides[this.currentSlide].getBoundingClientRect().top;
                this.slideContainer.style.transition = "";
                this.slides.forEach((element, index) => {
                    if (!element.parentElement) {
                        return;
                    }
                    element.parentElement.style.transition = "";
                    // Here, we no longer include the margin, since we don't want the slides
                    // to have a gap at the top. It's accounted for in the translation amount
                    // on the container, so it's all fine. The 5 is due to a somewhat strange effect
                    // that I don't quite understand.
                    if (bodyRect.width / bodyRect.height >= 152 / 89) {
                        element.parentElement.style.top = `calc(${5 + 58.125 * 152 / 89 * (index - centerSlide) + 100 * centerSlide} * var(--safe-vh))`;
                    }
                    else {
                        element.parentElement.style.top = `calc(${2.5 + 58.125 * (index - centerSlide)}vw + ${100 * centerSlide} * var(--safe-vh))`;
                    }
                });
                if (window.innerWidth / window.innerHeight >= 152 / 89) {
                    __classPrivateFieldGet(this, _Lapsa_bottomMarginElement, "f").style.top = `calc(${5 + 58.125 * 152 / 89 * (this.slides.length - centerSlide) + 100 * centerSlide} * var(--safe-vh))`;
                }
                else {
                    __classPrivateFieldGet(this, _Lapsa_bottomMarginElement, "f").style.top = `calc(${2.5 + 58.125 * (this.slides.length - centerSlide)}vw + ${100 * centerSlide} * var(--safe-vh))`;
                }
                this.slideContainer.style.transformOrigin = "center top";
                this.slideContainer.style.transform = `matrix(${scale}, 0, 0, ${scale}, 0, ${translation})`;
                document.documentElement.style.overflowY = "visible";
                const newTop = this.slides[this.currentSlide].getBoundingClientRect().top;
                // The old way was to scroll to correctTop and get newTop at that point.
                // If correctTop was 100 and newTop was 25, then after scrolling to position 100,
                // newTop was 25 further, so it was 125 at first.
                // Therefore, we want newTop - correctTop here.
                window.scrollTo(0, newTop - correctTop);
                __classPrivateFieldSet(this, _Lapsa_currentlyAnimating, false, "f");
                __classPrivateFieldSet(this, _Lapsa_inTableView, true, "f");
                __classPrivateFieldSet(this, _Lapsa_missedResizeAnimation, false, "f");
                this.slideContainer.classList.add("lapsa-table-view");
                resolve();
            }, duration);
        });
    }
    async closeTableView(selection, duration = this.tableViewAnimationTime) {
        if (!__classPrivateFieldGet(this, _Lapsa_inTableView, "f") || __classPrivateFieldGet(this, _Lapsa_currentlyAnimating, "f")) {
            return;
        }
        __classPrivateFieldSet(this, _Lapsa_currentlyAnimating, true, "f");
        this.currentSlide = selection;
        __classPrivateFieldGet(this, _Lapsa_instances, "m", _Lapsa_updateSearchParams).call(this);
        this.slideContainer.classList.remove("lapsa-table-view");
        // As with opening, this is a two-step process. First we snap back to a translated version,
        // and then we return everything to its rightful place.
        const bodyRect = document.body.getBoundingClientRect();
        // The goal is to have room to display just under 4 slides vertically,
        // then center on one so that the others are clipped, indicating it's scrollable.
        // In a horizontal orientation, exactly one slide fits per screen.
        // In a vertical one, we take a ratio.
        const slidesPerScreen = bodyRect.width / bodyRect.height >= 152 / 89
            ? 1
            : bodyRect.height / (bodyRect.width * 89 / 152);
        const scale = Math.min(slidesPerScreen / this.tableViewSlidesPerScreen, 1);
        // The first and last two slides have different animations since they can't be
        // in the middle of the screen in the table view.
        const centerSlide = Math.min(Math.max(1.25, this.currentSlide), this.slides.length - 2.25);
        const correctTop = this.slides[0].getBoundingClientRect().top;
        document.documentElement.style.overflowY = "hidden";
        document.body.style.overflowY = "hidden";
        this.slideContainer.style.transformOrigin = `center calc(${centerSlide * 100 + 50} * var(--safe-vh))`;
        this.slides.forEach((element, index) => {
            if (!element.parentElement) {
                return;
            }
            // On these, we include the top margin term to match with how things were before --
            // otherwise, the transformation center will be misaligned.
            if (bodyRect.width / bodyRect.height >= 152 / 89) {
                element.parentElement.style.top = `calc(${58.125 * 152 / 89 * (index - this.currentSlide) + 100 * this.currentSlide + 2.5} * var(--safe-vh))`;
            }
            else {
                element.parentElement.style.top = `calc(${58.125 * (index - this.currentSlide)}vw + ${100 * this.currentSlide} * var(--safe-vh) + (100 * var(--safe-vh) - 55.625vw) / 2)`;
            }
        });
        __classPrivateFieldGet(this, _Lapsa_bottomMarginElement, "f").style.top = "0";
        this.slideContainer.style.transform = `matrix(${scale}, 0, 0, ${scale}, 0, 0)`;
        window.scrollTo(0, 0);
        const newTop = this.slides[0].getBoundingClientRect().top;
        const scroll = correctTop - newTop;
        this.slideContainer.style.transform = `matrix(${scale}, 0, 0, ${scale}, 0, ${scroll})`;
        // While all the slides are moving, we also hide all builds that are currently shown
        // and request that the slide be reset to its initial state.
        const builds = this.slides[this.currentSlide].querySelectorAll("[data-build]");
        const oldTransitionStyles = new Array(builds.length);
        builds.forEach((element, index) => {
            oldTransitionStyles[index] = element.style.transition;
            element.style.transition = `opacity ${duration / 3}ms ${this.slideAnimateInEasing}`;
            element.style.opacity = "0";
        });
        // We don't await this one because we want it to run concurrently
        // with the table view animation.
        const callbacks = this.callbacks[this.slides[this.currentSlide].id];
        this.setupBuild({
            lapsa: this,
            slide: this.slides[this.currentSlide],
            forward: true,
        });
        const callback = callbacks === null || callbacks === void 0 ? void 0 : callbacks.reset;
        if (callback) {
            callback({
                lapsa: this,
                slide: this.slides[this.currentSlide],
                forward: true,
                duration: duration / 3
            });
        }
        setTimeout(() => {
            builds.forEach((element, index) => {
                element.style.transition = oldTransitionStyles[index];
            });
        }, duration / 3);
        // Now we can return all the slides to their proper places.
        // Someday, I will understand why these four lines need to be
        // the way they are. And then I will finally rest.
        this.slideContainer.style.transition = "";
        this.slideContainer.style.transform = `matrix(${scale}, 0, 0, ${scale}, 0, ${scroll})`;
        await new Promise(resolve => {
            setTimeout(() => {
                this.slideContainer.style.transition = `transform ${duration}ms ${this.tableViewEasing}`;
                this.slideContainer.style.transform = `matrix(1, 0, 0, 1, 0, ${-100 * this.currentSlide * __classPrivateFieldGet(this, _Lapsa_safeVh, "f")})`;
                this.slides.forEach((element, index) => {
                    if (!element.parentElement) {
                        return;
                    }
                    element.parentElement.style.transition = `top ${duration}ms ${this.tableViewEasing}`;
                    element.parentElement.style.top = window.innerWidth / window.innerHeight >= 152 / 89 ? `calc(${index * 100 + 2.5} * var(--safe-vh))` : `calc(${index * 100} * var(--safe-vh) + (100 * var(--safe-vh) - 55.625vw) / 2)`;
                });
                setTimeout(() => {
                    builds.forEach((element, index) => {
                        element.style.transition = oldTransitionStyles[index];
                    });
                    this.buildState = 0;
                    this.slideContainer.style.transition = "";
                    this.slides.forEach(element => {
                        if (!element.parentElement) {
                            return;
                        }
                        element.parentElement.style.transition = "";
                    });
                    __classPrivateFieldSet(this, _Lapsa_currentlyAnimating, false, "f");
                    __classPrivateFieldSet(this, _Lapsa_inTableView, false, "f");
                    document.body.style.position = "fixed";
                    if (__classPrivateFieldGet(this, _Lapsa_missedResizeAnimation, "f")) {
                        __classPrivateFieldSet(this, _Lapsa_startWindowHeight, __classPrivateFieldGet(this, _Lapsa_lastWindowHeight, "f"), "f");
                        __classPrivateFieldSet(this, _Lapsa_windowHeightAnimationFrame, 1, "f");
                        window.requestAnimationFrame(__classPrivateFieldGet(this, _Lapsa_resizeAnimationBound, "f"));
                    }
                    resolve();
                }, duration);
            }, 16);
        });
    }
    async showShelf() {
        if (this.permanentShelf || __classPrivateFieldGet(this, _Lapsa_shelfIsAnimating, "f") || !__classPrivateFieldGet(this, _Lapsa_slideShelf, "f").parentElement) {
            return;
        }
        __classPrivateFieldSet(this, _Lapsa_shelfIsOpen, true, "f");
        __classPrivateFieldSet(this, _Lapsa_shelfIsAnimating, true, "f");
        __classPrivateFieldGet(this, _Lapsa_slideShelf, "f").style.display = "flex";
        __classPrivateFieldGet(this, _Lapsa_slideShelf, "f").parentElement.style.paddingRight = "100px";
        setTimeout(async () => {
            __classPrivateFieldGet(this, _Lapsa_instances, "m", _Lapsa_hideSlideShelfIndicator).call(this, __classPrivateFieldGet(this, _Lapsa_slideShelfIndicator, "f"));
            await __classPrivateFieldGet(this, _Lapsa_instances, "m", _Lapsa_showSlideShelf).call(this, __classPrivateFieldGet(this, _Lapsa_slideShelf, "f"));
            __classPrivateFieldSet(this, _Lapsa_shelfIsAnimating, false, "f");
        }, 16);
    }
    async hideShelf() {
        if (this.permanentShelf || __classPrivateFieldGet(this, _Lapsa_shelfIsAnimating, "f") || !__classPrivateFieldGet(this, _Lapsa_slideShelf, "f").parentElement) {
            return;
        }
        __classPrivateFieldSet(this, _Lapsa_shelfIsOpen, false, "f");
        __classPrivateFieldSet(this, _Lapsa_shelfIsAnimating, true, "f");
        __classPrivateFieldGet(this, _Lapsa_slideShelf, "f").parentElement.style.paddingRight = "0";
        __classPrivateFieldGet(this, _Lapsa_instances, "m", _Lapsa_showSlideShelfIndicator).call(this, __classPrivateFieldGet(this, _Lapsa_slideShelfIndicator, "f"));
        await __classPrivateFieldGet(this, _Lapsa_instances, "m", _Lapsa_hideSlideShelf).call(this, __classPrivateFieldGet(this, _Lapsa_slideShelf, "f"));
        __classPrivateFieldGet(this, _Lapsa_slideShelf, "f").style.display = "none";
        __classPrivateFieldGet(this, _Lapsa_slideShelf, "f").parentElement.style.paddingRight = "";
        __classPrivateFieldSet(this, _Lapsa_shelfIsAnimating, false, "f");
    }
    async fadeUpIn(element, duration) {
        element.style.marginTop = `${__classPrivateFieldGet(this, _Lapsa_transitionAnimationDistance, "f")}px`;
        await new Promise(resolve => {
            setTimeout(() => {
                const oldTransitionStyle = element.style.transition;
                element.style.transition = `margin-top ${duration}ms ${this.slideAnimateInEasing}, opacity ${duration}ms ${this.slideAnimateInEasing}`;
                element.style.marginTop = "0";
                element.style.opacity = "1";
                setTimeout(() => {
                    element.style.transition = oldTransitionStyle;
                    resolve();
                }, duration);
            }, 16);
        });
    }
    async fadeUpOut(element, duration) {
        const oldTransitionStyle = element.style.transition;
        element.style.transition = `margin-top ${duration}ms ${this.slideAnimateOutEasing}, opacity ${duration}ms ${this.slideAnimateOutEasing}`;
        element.style.marginTop = `${-__classPrivateFieldGet(this, _Lapsa_transitionAnimationDistance, "f")}px`;
        element.style.opacity = "0";
        await new Promise(resolve => {
            setTimeout(() => {
                element.style.transition = oldTransitionStyle;
                resolve();
            }, duration);
        });
    }
    async fadeDownIn(element, duration) {
        element.style.marginTop = `${-__classPrivateFieldGet(this, _Lapsa_transitionAnimationDistance, "f")}px`;
        await new Promise(resolve => {
            setTimeout(() => {
                const oldTransitionStyle = element.style.transition;
                element.style.transition = `margin-top ${duration}ms ${this.slideAnimateInEasing}, opacity ${duration}ms ${this.slideAnimateInEasing}`;
                element.style.marginTop = "0";
                element.style.opacity = "1";
                setTimeout(() => {
                    element.style.transition = oldTransitionStyle;
                    resolve();
                }, duration);
            }, 16);
        });
    }
    async fadeDownOut(element, duration) {
        const oldTransitionStyle = element.style.transition;
        element.style.transition = `margin-top ${duration}ms ${this.slideAnimateOutEasing}, opacity ${duration}ms ${this.slideAnimateOutEasing}`;
        element.style.marginTop = `${__classPrivateFieldGet(this, _Lapsa_transitionAnimationDistance, "f")}px`;
        element.style.opacity = "0";
        await new Promise(resolve => {
            setTimeout(() => {
                element.style.transition = oldTransitionStyle;
                resolve();
            }, duration);
        });
    }
    async buildIn(element, duration) {
        element.style.marginTop = `${__classPrivateFieldGet(this, _Lapsa_transitionAnimationDistance, "f")}px`;
        element.style.marginBottom = `${-__classPrivateFieldGet(this, _Lapsa_transitionAnimationDistance, "f")}px`;
        await new Promise(resolve => {
            setTimeout(() => {
                const oldTransitionStyle = element.style.transition;
                element.style.transition = `margin-top ${duration}ms ${this.buildAnimateInEasing}, margin-bottom ${duration}ms ${this.buildAnimateInEasing}, opacity ${duration}ms ${this.buildAnimateInEasing}`;
                element.style.marginTop = "0";
                element.style.marginBottom = "0";
                element.style.opacity = "1";
                setTimeout(() => {
                    element.style.transition = oldTransitionStyle;
                    resolve();
                }, duration);
            }, 16);
        });
    }
    async buildOut(element, duration) {
        await new Promise(resolve => {
            setTimeout(() => {
                const oldTransitionStyle = element.style.transition;
                element.style.transition = `margin-top ${duration}ms ${this.buildAnimateOutEasing}, margin-bottom ${duration}ms ${this.buildAnimateOutEasing}, opacity ${duration}ms ${this.buildAnimateOutEasing}`;
                element.style.marginTop = `${__classPrivateFieldGet(this, _Lapsa_transitionAnimationDistance, "f")}px`;
                element.style.marginBottom = `${-__classPrivateFieldGet(this, _Lapsa_transitionAnimationDistance, "f")}px`;
                element.style.opacity = "0";
                setTimeout(() => {
                    element.style.transition = oldTransitionStyle;
                    resolve();
                }, duration);
            }, 16);
        });
    }
}
_Lapsa_rootSelector = new WeakMap(), _Lapsa_bottomMarginElement = new WeakMap(), _Lapsa_shelfContainer = new WeakMap(), _Lapsa_slideShelf = new WeakMap(), _Lapsa_shelfMargin = new WeakMap(), _Lapsa_shelfIsOpen = new WeakMap(), _Lapsa_shelfIsAnimating = new WeakMap(), _Lapsa_shelfIndicatorContainer = new WeakMap(), _Lapsa_slideShelfIndicator = new WeakMap(), _Lapsa_transitionAnimationDistance = new WeakMap(), _Lapsa_useSearchParams = new WeakMap(), _Lapsa_startingSlide = new WeakMap(), _Lapsa_numBuilds = new WeakMap(), _Lapsa_currentlyAnimating = new WeakMap(), _Lapsa_inTableView = new WeakMap(), _Lapsa_handleKeydownEventBound = new WeakMap(), _Lapsa_handleTouchstartEventBound = new WeakMap(), _Lapsa_handleTouchmoveEventBound = new WeakMap(), _Lapsa_handleMousemoveEventBound = new WeakMap(), _Lapsa_onResizeBound = new WeakMap(), _Lapsa_currentlyTouchDevice = new WeakMap(), _Lapsa_lastMousemoveEvent = new WeakMap(), _Lapsa_lastWindowHeight = new WeakMap(), _Lapsa_startWindowHeight = new WeakMap(), _Lapsa_windowHeightAnimationFrame = new WeakMap(), _Lapsa_windowHeightAnimationLastTimestamp = new WeakMap(), _Lapsa_resizeAnimationBound = new WeakMap(), _Lapsa_missedResizeAnimation = new WeakMap(), _Lapsa_currentlyDragging = new WeakMap(), _Lapsa_dragDistanceX = new WeakMap(), _Lapsa_lastTouchX = new WeakMap(), _Lapsa_dragDistanceY = new WeakMap(), _Lapsa_lastTouchY = new WeakMap(), _Lapsa_lastMoveThisDrag = new WeakMap(), _Lapsa_safeVh = new WeakMap(), _Lapsa_instances = new WeakSet(), _Lapsa_updateSearchParams = function _Lapsa_updateSearchParams() {
    if (!__classPrivateFieldGet(this, _Lapsa_useSearchParams, "f")) {
        return;
    }
    const url = new URL(window.location.href);
    url.searchParams.set("slide", this.currentSlide.toString());
    window.history.replaceState(null, "", url.toString());
}, _Lapsa_onResize = function _Lapsa_onResize() {
    if (__classPrivateFieldGet(this, _Lapsa_currentlyAnimating, "f")) {
        return;
    }
    __classPrivateFieldSet(this, _Lapsa_transitionAnimationDistance, window.innerWidth / window.innerHeight >= 152 / 89
        ? window.innerHeight * this.transitionAnimationDistanceFactor * 159 / 82
        : window.innerWidth * this.transitionAnimationDistanceFactor, "f");
    if (__classPrivateFieldGet(this, _Lapsa_inTableView, "f")) {
        const bodyRect = document.body.getBoundingClientRect();
        const slidesPerScreen = bodyRect.width / bodyRect.height >= 152 / 89
            ? 1
            : bodyRect.height / (bodyRect.width * 89 / 152);
        const scale = Math.min(slidesPerScreen / this.tableViewSlidesPerScreen, 1);
        const scaledSlidesPerScreen = slidesPerScreen / scale;
        // The first and last several slides have different animations
        // since they can't be in the middle of the screen in the table view.
        const centerSlide = Math.min(Math.max((scaledSlidesPerScreen - 1) / 2, this.currentSlide), this.slides.length - 1 - (scaledSlidesPerScreen - 1) / 2);
        const translation = bodyRect.width / bodyRect.height >= 152 / 89
            ? (58.125 * 152 / 89 * centerSlide - 100 * centerSlide) * scale * __classPrivateFieldGet(this, _Lapsa_safeVh, "f")
            : (58.125 * centerSlide) * scale * window.innerWidth / 100
                - 100 * centerSlide * scale * __classPrivateFieldGet(this, _Lapsa_safeVh, "f");
        this.slides.forEach((element, index) => {
            if (!element.parentElement) {
                return;
            }
            if (window.innerWidth / window.innerHeight >= 152 / 89) {
                element.parentElement.style.top = `calc(${5 + 58.125 * 152 / 89 * (index - centerSlide) + 100 * centerSlide} * var(--safe-vh))`;
            }
            else {
                element.parentElement.style.top = `calc(${2.5 + 58.125 * (index - centerSlide)}vw + ${100 * centerSlide} * var(--safe-vh))`;
            }
        });
        if (window.innerWidth / window.innerHeight >= 152 / 89) {
            __classPrivateFieldGet(this, _Lapsa_bottomMarginElement, "f").style.top = `calc(${5 + 58.125 * 152 / 89 * (this.slides.length - centerSlide) + 100 * centerSlide} * var(--safe-vh))`;
        }
        else {
            __classPrivateFieldGet(this, _Lapsa_bottomMarginElement, "f").style.top = `calc(${2.5 + 58.125 * (this.slides.length - centerSlide)}vw + ${100 * centerSlide} * var(--safe-vh))`;
        }
        this.slideContainer.style.transform = `matrix(${scale}, 0, 0, ${scale}, 0, ${translation})`;
        if (this.resizeOnTableView) {
            __classPrivateFieldSet(this, _Lapsa_startWindowHeight, __classPrivateFieldGet(this, _Lapsa_lastWindowHeight, "f"), "f");
            __classPrivateFieldSet(this, _Lapsa_windowHeightAnimationFrame, 1, "f");
            window.requestAnimationFrame(__classPrivateFieldGet(this, _Lapsa_resizeAnimationBound, "f"));
        }
        else {
            __classPrivateFieldSet(this, _Lapsa_missedResizeAnimation, true, "f");
        }
    }
    else {
        __classPrivateFieldSet(this, _Lapsa_safeVh, window.innerHeight / 100, "f");
        __classPrivateFieldGet(this, _Lapsa_rootSelector, "f").style.setProperty("--safe-vh", `${__classPrivateFieldGet(this, _Lapsa_safeVh, "f")}px`);
        this.slides.forEach((element, index) => {
            if (!element.parentElement) {
                return;
            }
            element.parentElement.style.top = window.innerWidth / window.innerHeight >= 152 / 89
                ? `calc(${index * 100 + 2.5} * var(--safe-vh))`
                : `calc(${index * 100} * var(--safe-vh) + (100 * var(--safe-vh) - 55.625vw) / 2)`;
        });
        this.slideContainer.style.transform = `matrix(1, 0, 0, 1, 0, ${-100 * this.currentSlide * __classPrivateFieldGet(this, _Lapsa_safeVh, "f")})`;
    }
}, _Lapsa_resizeAnimation = function _Lapsa_resizeAnimation(timestamp) {
    var _a;
    const timeElapsed = timestamp - __classPrivateFieldGet(this, _Lapsa_windowHeightAnimationLastTimestamp, "f");
    __classPrivateFieldSet(this, _Lapsa_windowHeightAnimationLastTimestamp, timestamp, "f");
    if (timeElapsed === 0) {
        return;
    }
    const t = .5 * (1 + Math.cos(Math.PI * (__classPrivateFieldGet(this, _Lapsa_windowHeightAnimationFrame, "f") / this.windowHeightAnimationFrames + 1)));
    const newHeight = __classPrivateFieldGet(this, _Lapsa_startWindowHeight, "f") * (1 - t) + window.innerHeight * t;
    __classPrivateFieldSet(this, _Lapsa_lastWindowHeight, newHeight, "f");
    __classPrivateFieldSet(this, _Lapsa_safeVh, newHeight / 100, "f");
    __classPrivateFieldGet(this, _Lapsa_rootSelector, "f").style.setProperty("--safe-vh", `${__classPrivateFieldGet(this, _Lapsa_safeVh, "f")}px`);
    if (__classPrivateFieldGet(this, _Lapsa_inTableView, "f")) {
        const slidesPerScreen = window.innerWidth / newHeight >= 152 / 89
            ? 1
            : newHeight / (window.innerWidth * 89 / 152);
        const scale = Math.min(slidesPerScreen / this.tableViewSlidesPerScreen, 1);
        const scaledSlidesPerScreen = slidesPerScreen / scale;
        const centerSlide = Math.min(Math.max((scaledSlidesPerScreen - 1) / 2, this.currentSlide), this.slides.length - 1 - (scaledSlidesPerScreen - 1) / 2);
        const translation = window.innerWidth / newHeight >= 152 / 89
            ? (58.125 * 152 / 89 * centerSlide - 100 * centerSlide) * scale * __classPrivateFieldGet(this, _Lapsa_safeVh, "f")
            : (58.125 * centerSlide) * scale * window.innerWidth / 100
                - 100 * centerSlide * scale * __classPrivateFieldGet(this, _Lapsa_safeVh, "f");
        this.slideContainer.style.transform = `matrix(${scale}, 0, 0, ${scale}, 0, ${translation})`;
    }
    __classPrivateFieldSet(this, _Lapsa_windowHeightAnimationFrame, (_a = __classPrivateFieldGet(this, _Lapsa_windowHeightAnimationFrame, "f"), _a++, _a), "f");
    if (__classPrivateFieldGet(this, _Lapsa_windowHeightAnimationFrame, "f") <= this.windowHeightAnimationFrames) {
        window.requestAnimationFrame(__classPrivateFieldGet(this, _Lapsa_resizeAnimationBound, "f"));
    }
}, _Lapsa_showSlideShelf = async function _Lapsa_showSlideShelf(element, duration = this.shelfAnimationTime) {
    const oldTransitionStyle = element.style.transition;
    element.style.transition = `margin-left ${duration}ms ${this.shelfAnimateInEasing}, opacity ${duration}ms ${this.shelfAnimateInEasing}`;
    element.style.marginLeft = `${__classPrivateFieldGet(this, _Lapsa_shelfMargin, "f")}px`;
    element.style.opacity = "1";
    await new Promise(resolve => {
        setTimeout(() => {
            element.style.transition = oldTransitionStyle;
            resolve();
        }, duration);
    });
}, _Lapsa_hideSlideShelf = async function _Lapsa_hideSlideShelf(element, duration = this.shelfAnimationTime) {
    const oldTransitionStyle = element.style.transition;
    element.style.transition = `margin-left ${duration}ms ${this.shelfAnimateOutEasing}, opacity ${duration}ms ${this.shelfAnimateOutEasing}`;
    element.style.marginLeft = `${-__classPrivateFieldGet(this, _Lapsa_shelfMargin, "f")}px`;
    element.style.opacity = "0";
    await new Promise(resolve => {
        setTimeout(() => {
            element.style.transition = oldTransitionStyle;
            resolve();
        }, duration);
    });
}, _Lapsa_showSlideShelfIndicator = async function _Lapsa_showSlideShelfIndicator(element, duration = this.shelfAnimationTime) {
    if (!this.useShelfIndicator || !element) {
        return;
    }
    const oldTransitionStyle = element.style.transition;
    element.style.transition = `opacity ${duration}ms ${this.shelfAnimateOutEasing}`;
    element.style.opacity = "1";
    await new Promise(resolve => {
        setTimeout(() => {
            element.style.transition = oldTransitionStyle;
            resolve();
        }, duration);
    });
}, _Lapsa_hideSlideShelfIndicator = async function _Lapsa_hideSlideShelfIndicator(element, duration = this.shelfAnimationTime) {
    if (!this.useShelfIndicator || !element) {
        return;
    }
    const oldTransitionStyle = element.style.transition;
    element.style.transition = `opacity ${duration}ms ${this.shelfAnimateInEasing}`;
    element.style.opacity = "0";
    await new Promise(resolve => {
        setTimeout(() => {
            element.style.transition = oldTransitionStyle;
            resolve();
        }, duration);
    });
}, _Lapsa_handleKeydownEvent = function _Lapsa_handleKeydownEvent(e) {
    if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " " || e.key === "Enter") {
        this.nextSlide();
    }
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        this.previousSlide();
    }
}, _Lapsa_handleTouchstartEvent = function _Lapsa_handleTouchstartEvent(e) {
    __classPrivateFieldSet(this, _Lapsa_currentlyTouchDevice, true, "f");
    __classPrivateFieldGet(this, _Lapsa_slideShelf, "f").classList.remove("lapsa-hover");
    this.slideContainer.classList.remove("lapsa-hover");
    __classPrivateFieldSet(this, _Lapsa_currentlyDragging, false, "f");
    const targetContainsLapsaInteractableClass = (e.target instanceof HTMLElement)
        && e.target.classList.contains("lapsa-interactable");
    if (__classPrivateFieldGet(this, _Lapsa_inTableView, "f")
        || e.touches.length > 1
        || targetContainsLapsaInteractableClass) {
        return;
    }
    __classPrivateFieldSet(this, _Lapsa_currentlyDragging, true, "f");
    __classPrivateFieldSet(this, _Lapsa_lastMoveThisDrag, 0, "f");
    __classPrivateFieldSet(this, _Lapsa_dragDistanceX, 0, "f");
    __classPrivateFieldSet(this, _Lapsa_lastTouchX, -1, "f");
    __classPrivateFieldSet(this, _Lapsa_dragDistanceY, 0, "f");
    __classPrivateFieldSet(this, _Lapsa_lastTouchY, -1, "f");
}, _Lapsa_handleTouchmoveEvent = function _Lapsa_handleTouchmoveEvent(e) {
    if (__classPrivateFieldGet(this, _Lapsa_inTableView, "f") || !__classPrivateFieldGet(this, _Lapsa_currentlyDragging, "f") || e.touches.length > 1) {
        return;
    }
    const targetContainsLapsaInteractableClass = (e.target instanceof HTMLElement)
        && e.target.classList.contains("lapsa-interactable");
    if (targetContainsLapsaInteractableClass) {
        return;
    }
    e.preventDefault();
    if (__classPrivateFieldGet(this, _Lapsa_lastTouchY, "f") === -1) {
        __classPrivateFieldSet(this, _Lapsa_lastTouchY, e.touches[0].clientY, "f");
    }
    else {
        __classPrivateFieldSet(this, _Lapsa_dragDistanceY, __classPrivateFieldGet(this, _Lapsa_dragDistanceY, "f") + (e.touches[0].clientY - __classPrivateFieldGet(this, _Lapsa_lastTouchY, "f")), "f");
        __classPrivateFieldSet(this, _Lapsa_lastTouchY, e.touches[0].clientY, "f");
        if (__classPrivateFieldGet(this, _Lapsa_dragDistanceY, "f") < -this.dragDistanceThreshhold
            && (__classPrivateFieldGet(this, _Lapsa_lastMoveThisDrag, "f") === 0
                || __classPrivateFieldGet(this, _Lapsa_lastMoveThisDrag, "f") === -1)) {
            __classPrivateFieldSet(this, _Lapsa_lastMoveThisDrag, 1, "f");
            this.nextSlide();
        }
        else if (__classPrivateFieldGet(this, _Lapsa_dragDistanceY, "f") > this.dragDistanceThreshhold
            && (__classPrivateFieldGet(this, _Lapsa_lastMoveThisDrag, "f") === 0
                || __classPrivateFieldGet(this, _Lapsa_lastMoveThisDrag, "f") === 1)) {
            __classPrivateFieldSet(this, _Lapsa_lastMoveThisDrag, -1, "f");
            this.previousSlide();
        }
    }
    if (__classPrivateFieldGet(this, _Lapsa_lastTouchX, "f") === -1) {
        __classPrivateFieldSet(this, _Lapsa_lastTouchX, e.touches[0].clientX, "f");
    }
    else {
        __classPrivateFieldSet(this, _Lapsa_dragDistanceX, __classPrivateFieldGet(this, _Lapsa_dragDistanceX, "f") + (e.touches[0].clientX - __classPrivateFieldGet(this, _Lapsa_lastTouchX, "f")), "f");
        __classPrivateFieldSet(this, _Lapsa_lastTouchX, e.touches[0].clientX, "f");
        if (__classPrivateFieldGet(this, _Lapsa_dragDistanceX, "f") < -this.dragDistanceThreshhold
            && (__classPrivateFieldGet(this, _Lapsa_lastMoveThisDrag, "f") === 0
                || __classPrivateFieldGet(this, _Lapsa_lastMoveThisDrag, "f") === 2)) {
            __classPrivateFieldSet(this, _Lapsa_lastMoveThisDrag, -2, "f");
            this.hideShelf();
        }
        else if (__classPrivateFieldGet(this, _Lapsa_dragDistanceX, "f") > this.dragDistanceThreshhold
            && (__classPrivateFieldGet(this, _Lapsa_lastMoveThisDrag, "f") === 0
                || __classPrivateFieldGet(this, _Lapsa_lastMoveThisDrag, "f") === -2)) {
            __classPrivateFieldSet(this, _Lapsa_lastMoveThisDrag, 2, "f");
            this.showShelf();
        }
    }
}, _Lapsa_handleMousemoveEvent = function _Lapsa_handleMousemoveEvent() {
    if (__classPrivateFieldGet(this, _Lapsa_currentlyTouchDevice, "f")) {
        const timeBetweenMousemoves = Date.now() - __classPrivateFieldGet(this, _Lapsa_lastMousemoveEvent, "f");
        __classPrivateFieldSet(this, _Lapsa_lastMousemoveEvent, Date.now(), "f");
        // Checking if it's >= 3 kinda sucks, but it seems like touch devices
        // like to fire two mousemoves in quick succession sometimes.
        // They also like to make that delay exactly 33.
        // Look, I hate this too, but it needs to be here.
        if (timeBetweenMousemoves >= 3
            && timeBetweenMousemoves <= 50
            && timeBetweenMousemoves !== 33) {
            __classPrivateFieldSet(this, _Lapsa_currentlyTouchDevice, false, "f");
            __classPrivateFieldGet(this, _Lapsa_slideShelf, "f").classList.add("lapsa-hover");
            this.slideContainer.classList.add("lapsa-hover");
        }
    }
};
export default Lapsa;

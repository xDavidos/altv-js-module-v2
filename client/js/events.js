requireBinding("shared/events.js");
/** @type {typeof import("../../shared/js/utils.js")} */
const { assert } = requireBinding("shared/utils.js");

// WebView events
addEventsToClass(alt.WebView);
alt.Events.onWebViewEvent(({ target, name, args }) => {
    onClassEvent(target, name, args);
});

// Rmlui events
addEventsToClass(alt.RmlElement);
alt.Events.onRmluiEvent(({ target, name, args }) => {
    onClassEvent(target, name, args, true);
});

// *** Helpers ***
function addEventsToClass(class_) {
    if (!class_) return;

    Object.defineProperties(class_.prototype, {
        listeners: {
            get: function () {
                return Object.fromEntries(this.__eventHandlers);
            }
        },
        on: function (eventName, listener) {
            assert(eventName && typeof eventName === "string", `Invalid event name: ${eventName}`);
            assert(listener && typeof listener === "function", `Invalid listener: ${listener}`);

            if (!this.__eventHandlers.has(eventName)) this.__eventHandlers.set(eventName, new Set());
            this.__eventHandlers.get(eventName).add(listener);
        },
        off: function (eventName, listener) {
            assert(eventName && typeof eventName === "string", `Invalid event name: ${eventName}`);
            assert(listener && typeof listener === "function", `Invalid listener: ${listener}`);

            if (!this.__eventHandlers.has(eventName)) return;
            this.__eventHandlers.get(eventName).delete(listener);
        },

        __eventHandlers: {
            value: new Map(),
            enumerable: false,
            writable: true,
            configurable: false
        }
    });
}

function onClassEvent(target, eventName, args, passArgsRaw = false) {
    const listeners = target?.__eventHandlers?.get(eventName);
    if (!listeners) return;
    for (const listener of listeners) {
        if (passArgsRaw) listener(args);
        else listener(...args);
    }
}
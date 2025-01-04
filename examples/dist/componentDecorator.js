var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
import { Geometry, Text, component } from '@eulertour/studio';
let LabeledSquare = (() => {
    var _a, _LabeledSquare_label_accessor_storage;
    let _classSuper = Geometry.Square;
    let _label_decorators;
    let _label_initializers = [];
    let _label_extraInitializers = [];
    return _a = class LabeledSquare extends _classSuper {
            get label() { return __classPrivateFieldGet(this, _LabeledSquare_label_accessor_storage, "f"); }
            set label(value) { __classPrivateFieldSet(this, _LabeledSquare_label_accessor_storage, value, "f"); }
            constructor(sideLength) {
                super(sideLength);
                this.labelScale = 0.65;
                _LabeledSquare_label_accessor_storage.set(this, __runInitializers(this, _label_initializers, void 0));
                __runInitializers(this, _label_extraInitializers);
                this.label = new Text.Text('\\substack{\\text{This label is a component} \\\\ \\text{added with a decorator}}');
                this.label.setScale(this.labelScale);
                this.label.moveAbove(this);
            }
        },
        _LabeledSquare_label_accessor_storage = new WeakMap(),
        (() => {
            var _b;
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_b = _classSuper[Symbol.metadata]) !== null && _b !== void 0 ? _b : null) : void 0;
            _label_decorators = [component];
            __esDecorate(_a, null, _label_decorators, { kind: "accessor", name: "label", static: false, private: false, access: { has: obj => "label" in obj, get: obj => obj.label, set: (obj, value) => { obj.label = value; } }, metadata: _metadata }, _label_initializers, _label_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
export default class Example {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.revealInterval = 1;
        this.lastRevealTime = 0;
        this.square = new LabeledSquare(2);
        this.scene.add(this.square);
    }
    update(_, t) {
        if (t - this.lastRevealTime >= this.revealInterval) {
            if (this.square.label.isHidden()) {
                this.square.label.reveal();
            }
            else {
                this.square.label.hide();
            }
            this.lastRevealTime = t;
        }
    }
}

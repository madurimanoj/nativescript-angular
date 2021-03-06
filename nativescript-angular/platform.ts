// Always import platform-common first - because polyfills
import {
    NativeScriptPlatformRef,
    AppOptions,
    PlatformFactory,
    COMMON_PROVIDERS
} from "./platform-common";

import { NSFileSystem } from "./file-system/ns-file-system";

import {
    ElementSchemaRegistry,
    ResourceLoader,
} from "@angular/compiler";

import {
    ɵplatformCoreDynamic as platformCoreDynamic
} from "@angular/platform-browser-dynamic";

import {
    DOCUMENT,
    ɵINTERNAL_BROWSER_PLATFORM_PROVIDERS as INTERNAL_BROWSER_PLATFORM_PROVIDERS
} from "@angular/platform-browser";

import {
    COMPILER_OPTIONS,
    PlatformRef,
    InjectionToken,
    ViewEncapsulation,
    createPlatformFactory,
    MissingTranslationStrategy,
    StaticProvider,
} from "@angular/core";

// Add a fake polyfill for the document object
(<any>global).document = (<any>global).document || {};
const doc = (<any>global).document;
doc.body = Object.assign((doc.body || {}), {
    isOverride: true,
});

// Work around a TS bug requiring an imports of
// InjectionToken, ViewEncapsulation and MissingTranslationStrategy
// without using them
if ((<any>global).___TS_UNUSED) {
    (() => InjectionToken)();
    (() => ViewEncapsulation)();
    (() => MissingTranslationStrategy)();
}

// Register DOM adapter, if possible. Dynamic platform only!
import "./dom-adapter";

import { NativeScriptElementSchemaRegistry } from "./schema-registry";
import { FileSystemResourceLoader } from "./resource-loader";

export const NS_COMPILER_PROVIDERS: StaticProvider[] = [
    INTERNAL_BROWSER_PLATFORM_PROVIDERS,
    {
        provide: COMPILER_OPTIONS,
        useValue: {
            providers: [
                { provide: NSFileSystem, deps: []},
                { provide: ResourceLoader, useClass: FileSystemResourceLoader, deps: [NSFileSystem] },
                { provide: ElementSchemaRegistry, useClass: NativeScriptElementSchemaRegistry, deps: [] },
            ]
        },
        multi: true
    },
    {
        provide: DOCUMENT,
        useValue: doc,
    },
];

// Dynamic platform
const _platformNativeScriptDynamic: PlatformFactory = createPlatformFactory(
    platformCoreDynamic, "nativeScriptDynamic", [...COMMON_PROVIDERS, ...NS_COMPILER_PROVIDERS]);

export function platformNativeScriptDynamic(
    options?: AppOptions,
    extraProviders?: any[]
): PlatformRef {
    // Return raw platform to advanced users only if explicitly requested
    if (options && options.bootInExistingPage === true) {
        return _platformNativeScriptDynamic(extraProviders);
    } else {
        return new NativeScriptPlatformRef(_platformNativeScriptDynamic(extraProviders), options);
    }
}

interface ReactNativeFetchOptions {
    textStreaming?: boolean;
}

declare global {
    namespace RequestInit {
        interface RequestInit {
            reactNative?: ReactNativeFetchOptions;
        }
    }
}
  
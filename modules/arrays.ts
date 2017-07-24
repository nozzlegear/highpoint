/**
 * Convenience function that takes a list of values and converts them to an array, while constraining the values to the given type.
 */
export function constrainArray<T>(params: T[]) {
    return [...params];
}
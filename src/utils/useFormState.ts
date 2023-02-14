import { useReducer, useRef } from 'react';

/**
 * Note generally an anti-pattern to force update,
 * but when using the value of a useRef in a form this
 * can be a simple kludge to avoid too many re-renders
 * from the form itself, but force a rerender when you explicitly set the useRef.
 */
function useForceUpdate() {
  return useReducer(x => x + 1, 0)[1];
}

/**
 * Form-friendly state that is made of a useRef and a setState-like callback
 * This allows normal form actions to just call set the useRef current variable
 * while the setState-like callback still triggers rerenders.
 * @param initialValue the initial useRef value
 */
export function useFormState<T>(initialValue: T) {
  const forceUpdate = useForceUpdate();
  const state = useRef(initialValue);
  const setState = (value: T) => {
    state.current = value;
    forceUpdate();
  };
  return [state, setState] as const;
}

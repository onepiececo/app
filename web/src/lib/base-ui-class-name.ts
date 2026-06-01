export type BaseUiClassName<State> =
  | string
  | ((state: State) => string | undefined)
  | undefined;

export const mergeBaseUiClassName = <State,>(
  slot: (options?: { class?: string }) => string,
  className: BaseUiClassName<State>,
) => {
  if (typeof className === "function") {
    return (state: State) => slot({ class: className(state) });
  }

  return slot({ class: className });
};

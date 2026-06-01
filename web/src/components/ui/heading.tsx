import type * as React from "react";
import { tv } from "tailwind-variants";

type Level = 1 | 2 | 3 | 4 | 5 | 6;

export const headingVariants = tv({
  slots: {
    heading:
      "font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-xl",
    subheading:
      "font-heading text-base font-semibold tracking-tight text-foreground sm:text-sm",
  },
});

type HeadingProps = {
  level?: Level;
} & React.ComponentPropsWithoutRef<"h1">;

export const Heading = (props: HeadingProps): React.ReactElement => {
  const { level = 1, className, ...rest } = props;
  const Tag = `h${level}` as `h${Level}`;
  const styles = headingVariants();

  return <Tag {...rest} className={styles.heading({ class: className })} />;
};

export const Subheading = (props: HeadingProps): React.ReactElement => {
  const { level = 2, className, ...rest } = props;
  const Tag = `h${level}` as `h${Level}`;
  const styles = headingVariants();

  return <Tag {...rest} className={styles.subheading({ class: className })} />;
};

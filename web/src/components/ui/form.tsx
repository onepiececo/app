"use client";

import { Form as FormPrimitive } from "@base-ui/react/form";
import type React from "react";

export function Form({
  ...props
}: FormPrimitive.Props): React.ReactElement {
  return <FormPrimitive data-slot="form" {...props} />;
}

export { FormPrimitive };

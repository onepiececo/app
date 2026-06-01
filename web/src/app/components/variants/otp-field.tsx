"use client";

import { useState } from "react";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import {
  OTPField,
  OTPFieldInput,
  OTPFieldSeparator,
} from "@/components/ui/otp-field";

export function OtpFieldVariants() {
  const [code, setCode] = useState("");

  return (
    <div className="p-1">
      <Field>
        <FieldLabel>One-time code</FieldLabel>
        <OTPField length={6} value={code} onValueChange={setCode}>
          <OTPFieldInput />
          <OTPFieldInput />
          <OTPFieldInput />
          <OTPFieldSeparator />
          <OTPFieldInput />
          <OTPFieldInput />
          <OTPFieldInput />
        </OTPField>
        <FieldDescription>Check your email for the 6-digit code.</FieldDescription>
      </Field>
    </div>
  );
}

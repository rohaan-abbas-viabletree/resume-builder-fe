import React, { useState } from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

const PhoneInputComponent = ({
  className = "",
  disabled = false,
  placeholder = "Enter phone number",
  size = "middle",
  ...rest
}: {
  disabled?: boolean;
  className?: string;
  size?: "small" | "middle" | "large";
  placeholder?: string;
  ref?: any;
}) => {
  const [phone, setPhone] = useState("");

  const handlePhoneChange = (value: string | undefined) => {
    setPhone(value || "");
  };

  // Define size classes
  const sizeClasses = {
    small: "text-sm ",
    middle: "text-base ",
    large: "text-lg ",
  };

  return (
    <div className={`w-full ${className}`}>
      <PhoneInput
        defaultCountry="PK"
        value={phone}
        onChange={handlePhoneChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full border rounded-[6px] min-h-[33px] border-[#000] px-2 ${
          disabled
            ? "bg-bg_input_disable_color text-black border-border_input_disabled placeholder:text-black"
            : "bg-white text-gray-900 placeholder-gray-400"
        } ${sizeClasses[size]}`}
        {...rest}
      />
      {/* Validation message */}
      {phone && !isValidPhoneNumber(phone) && (
        <span className="text-red-500 text-sm">Invalid phone number</span>
      )}
    </div>
  );
};

export default PhoneInputComponent;

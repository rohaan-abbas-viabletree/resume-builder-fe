import { Container, ContainerProduct } from "@/app/client-types";
import { REQUIRED_MSG, REQUIRED_MSG_NUMBER_FIELD } from "@/static/constants";
import { IDefaultCardFileType, ISaveType } from "@/types/common";
import { notification } from "antd";
import { isValidPhoneNumber } from "react-phone-number-input";

export const validatorField = (
  _: any,
  value: any,
  min = 3,
  max = 80,
  noLimit = false,
) => {
  if (!value || value?.length < 1) {
    return Promise.reject(new Error("Field is required."));
  } else if (value?.length > 0 && value?.trim() === "") {
    return Promise.reject(new Error("Cannot accept only white spaces."));
  } else if (value?.length < min) {
    return Promise.reject(
      new Error(`Must be equal or greater than ${min} characters.`),
    );
  } else if (!noLimit && value?.length > max) {
    return Promise.reject(
      new Error(`Must be less than ${max + 1} characters.`),
    );
  } else {
    return Promise.resolve();
  }
};

export const formatNumber = (value: number) => {
  // const decimalPlaces = value.toString().split(".")[1]?.length || 0; // Count decimal places dynamically
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const validatorFieldUpdated = (
  _: any,
  value = "",
  minLength = 3,
  maxLength = 80,
  onlyNumber = false,
  isRequired = true,
  greater: number | undefined = undefined,
  hasLimit = true,
  isDecimal = true,
  maxValue: number | undefined = undefined,
) => {
  if (isRequired && (!value || value?.length < 1)) {
    return Promise.reject(
      new Error(onlyNumber ? REQUIRED_MSG_NUMBER_FIELD : "Field is required."),
    );
  } else if (value?.length > 0 && value?.trim() === "") {
    return Promise.reject(new Error("Cannot accept only white spaces."));
  } else if (value?.length < minLength && isRequired) {
    return Promise.reject(
      new Error(`Must be equal or greater than ${minLength} characters.`),
    );
  } else if (hasLimit && value?.toString()?.length > maxLength) {
    return Promise.reject(
      new Error(`Must be less than ${maxLength + 1} characters.`),
    );
  } else if (
    isRequired &&
    onlyNumber &&
    !/^-?[0-9]*(?:\.[0-9]+)?$/.test(value)
  ) {
    return Promise.reject(new Error("Only numeric values are accepted."));
  } else if (
    !isRequired &&
    value?.length > 0 &&
    onlyNumber &&
    !/^-?[0-9]*(?:\.[0-9]+)?$/.test(value)
  ) {
    return Promise.reject(new Error("Only numeric values are accepted."));
  } else if (
    greater !== undefined &&
    greater > Number(value) &&
    // isRequired &&
    onlyNumber
  ) {
    return Promise.reject(new Error(`Must be ${greater} or greater than 0`));
  } else if (
    maxValue !== undefined &&
    Number(value) > maxValue &&
    // isRequired &&
    onlyNumber
  ) {
    return Promise.reject(new Error(`Must not be greater than ${maxValue}.`));
  } else if (!isDecimal && value?.toString()?.includes(".")) {
    return Promise.reject(new Error(`Must not contain decimal value`));
  } else {
    return Promise.resolve();
  }
  //  else if (
  //   isRequired &&
  //   onlyNumber &&
  //   !/^-?[0-9]*(?:\.[0-9]+)?$/.test(value) &&
  //   Number(value) <= min
  // ) {
  //   return Promise.reject(new Error(`Value must be greater than ${min}.`));
  // } else if (
  //   !isRequired &&
  //   value?.length > 0 &&
  //   onlyNumber &&
  //   !/^-?[0-9]*(?:\.[0-9]+)?$/.test(value) &&
  //   parseInt(value) <= min
  // ) {
  //   return Promise.reject(new Error(`Value must be greater than ${min}.`));
  // }
};

export const validatePhoneNumber = (
  _: any,
  value: string = "",
  isRequired: boolean = true,
  minLength: number = 10,
  maxLength: number = 15,
): Promise<void> => {
  if (isRequired && (!value || value?.length < 1)) {
    return Promise.reject(new Error("Phone number is required."));
  } else if (value?.length > 0 && value?.trim() === "") {
    return Promise.reject(new Error("Cannot accept only white spaces."));
  } else if (!isRequired && (!value || value?.length === 0)) {
    return Promise.resolve();
  } else if (value?.length < minLength) {
    return Promise.reject(
      new Error(`Phone number must be at least ${minLength} characters.`),
    );
  } else if (value?.length > maxLength) {
    return Promise.reject(
      new Error(`Phone number must be less than ${maxLength + 1} characters.`),
    );
  } else if (!isValidPhoneNumber(value)) {
    return Promise.reject(new Error("Invalid phone number format."));
  } else {
    return Promise.resolve();
  }
};

export const getDefaultFile = (url: string, id = ""): IDefaultCardFileType => {
  const splitFileUrl = url.split("/");
  const fileName = splitFileUrl[splitFileUrl.length - 1];
  const fileObj = {
    name: fileName,
    status: "done",
    uid: id ?? Math.round(Math.random()),
    url,
    type: extension(fileName) || "",
  };
  return fileObj;
};
export function extension(filename: string) {
  const r = /.+\.(.+)$/.exec(filename);
  return r ? r[1] : null;
}

export const validatorFieldNotRequired = (
  _: any,
  value: any,
  min = 3,
  max = 80,
  hasLimit = true,
) => {
  if (value?.length > 0 && value?.trim() === "") {
    return Promise.reject(new Error("Cannot accept only white spaces."));
  } else if (value && value?.length < min) {
    return Promise.reject(
      new Error(`Must be equal or greater than ${min} characters.`),
    );
  } else if (hasLimit && value && value?.length > max) {
    return Promise.reject(
      new Error(`Must be less than ${max + 1} characters.`),
    );
  } else {
    return Promise.resolve();
  }
};

export const openNotification = (
  msg: string,
  type: "success" | "error" | "info" = "success",
) => {
  if (type === "success") {
    notification.success({
      message: `Notification`,
      description: msg,
      placement: "topRight",
    });
  } else if (type === "info") {
    notification.info({
      message: `Notification`,
      description: msg,
      placement: "topRight",
    });
  } else {
    notification.error({
      message: `Notification`,
      description: msg,
      placement: "topRight",
    });
  }
};

export const checkValidationSubmitError = (
  field: string,
  error: { error: string; field: string; message: string },
) => {
  return {
    validator: () => {
      if (field === error?.field && error) {
        return Promise.reject(new Error(error.message));
      } else {
        return Promise.resolve();
      }
    },
  };
};

export const checkErrorOnSameCountries = (value: string, value2: string) => {
  return {
    validator: () => {
      if (value && value === value2) {
        return Promise.reject(new Error("Countries should not be same"));
      } else {
        return Promise.resolve();
      }
    },
  };
};

export const validateMultiSelectField = (_: any, value: any) => {
  if (!value || value?.length < 1) {
    return Promise.reject(new Error("Field is required."));
  } else {
    return Promise.resolve();
  }
};
export const isEmailValid = (email: string) => {
  const re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email?.trim());
};

export const EMAIL_RULE = [
  {
    validator: (_: any, value: string) => {
      if (!value || value?.length < 1) {
        return Promise.reject(new Error("Field is required"));
      } else if (value?.includes(" ")) {
        return Promise.reject(new Error("Cannot accept whitespaces."));
      } else if (value && !isEmailValid(value)) {
        return Promise.reject(new Error("Invalid email address."));
      } else {
        return Promise.resolve();
      }
    },
  },
];

export function debounce(func: any, delay: number) {
  let timeout: any;
  return (...args: any) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

export const handleUploadFileRules = (
  fileRules: string[],
  required = false,
  filesRecommended: string[],
) => {
  return [
    {
      validator: (_: any, value: any) => {
        if (required && !value?.length) {
          return Promise.reject(new Error(REQUIRED_MSG));
        } else if (!value?.length) {
          return Promise.resolve();
        } else if (
          value?.length > 0 &&
          value?.some(({ type }: { type: string }) => !fileRules.includes(type))
        ) {
          return Promise.reject(
            new Error(
              filesRecommended?.length
                ? "Only " + filesRecommended?.join(", ") + " files are required"
                : "Invalid file type",
            ),
          );
        } else {
          return Promise.resolve();
        }
      },
    },
  ];
};

export const SAVE_TYPES: ISaveType = {
  SAVE: "SAVE",
  SAVE_CLOSE: "SAVE_CLOSE",
  SAVE_ADD_NEW: "SAVE_ADD_NEW",
  CLOSE: "CLOSE",
};
export const convertToMetricTons = (weight: number, unit: string): number => {
  switch (unit) {
    case "GM":
      return weight / 1_000_000; // Convert grams to metric tons
    case "KG":
      return weight / 1_000; // Convert kilograms to metric tons
    case "MT":
      return weight; // Already in metric tons
    default:
      return weight;
  }
};

export const convertToKilograms = (weight: number, unit: string): number => {
  switch (unit) {
    case "GM":
      return weight / 1_000; // Convert grams to kilograms
    case "KG":
      return weight; // Already in kilograms
    case "MT":
      return weight * 1_000; // Convert metric tons to kilograms
    default:
      return weight;
  }
};

export const findEmptyPaths = (obj: any, currentPath = ""): string[] => {
  let emptyPaths: string[] = [];

  if (obj === null || obj === undefined || obj === "") {
    emptyPaths.push(currentPath || "root");
  } else if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      console.log(item, index, "Fedtew");

      const childPath = `${currentPath}[${index}]`;
      emptyPaths = emptyPaths.concat(findEmptyPaths(item, childPath));
    });
  } else if (typeof obj === "object") {
    for (const [key, value] of Object.entries(obj)) {
      if (
        key === "order_no_ref" ||
        key === "product_name_no_ref" ||
        key === "eta_pol" ||
        key === "etd_pol" ||
        key === "eta_pod" ||
        key === "etd_pod" ||
        key === "gate_in_cut_off" ||
        key === "load_cut_off" ||
        key === "terminal_name" ||
        key === "voy_no"
      ) {
        return [];
      } else {
        const childPath = currentPath ? `${currentPath}.${key}` : key;
        emptyPaths = emptyPaths.concat(findEmptyPaths(value, childPath));
      }
    }
  }

  return emptyPaths;
};
export function getBoxCount(
  cp: ContainerProduct,
  container: Container,
): number {
  // Prefer product-level fields first, fallback to container-level
  const boxesRaw =
    cp?.no_of_box ?? container?.total_no_of_boxes_in_container ?? 0;

  return Number(boxesRaw) || 0;
}

export const escapeHtml = (unsafe?: string | number | null): string => {
  if (unsafe === null || unsafe === undefined) return "";

  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};
export const formatDate = (val: any) => {
  if (!val) return "";
  if (typeof val === "string") {
    return val.includes("T") ? val.split("T")[0] : val;
  }
  if (val instanceof Date) {
    return val.toISOString().split("T")[0];
  }
  return "";
};

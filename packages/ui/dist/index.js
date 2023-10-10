"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.tsx
var src_exports = {};
__export(src_exports, {
  Button: () => Button,
  Input: () => Input,
  RadialProgressBar: () => RadialProgressBar,
  Spinner: () => Spinner,
  TextArea: () => TextArea
});
module.exports = __toCommonJS(src_exports);

// src/buttons/button.tsx
var React = __toESM(require("react"));

// src/buttons/helper.tsx
var buttonStyling = {
  primary: {
    default: `text-white bg-custom-primary-100`,
    hover: `hover:bg-custom-primary-200`,
    pressed: `focus:text-custom-brand-40 focus:bg-custom-primary-200`,
    disabled: `cursor-not-allowed !bg-custom-primary-60 hover:bg-custom-primary-60`
  },
  "accent-primary": {
    default: `bg-custom-primary-10 text-custom-primary-100`,
    hover: `hover:bg-custom-primary-20 hover:text-custom-primary-200`,
    pressed: `focus:bg-custom-primary-20`,
    disabled: `cursor-not-allowed !text-custom-primary-60`
  },
  "outline-primary": {
    default: `text-custom-primary-100 bg-custom-background-100 border border-custom-primary-100`,
    hover: `hover:border-custom-primary-80 hover:bg-custom-primary-10`,
    pressed: `focus:text-custom-primary-80 focus:bg-custom-primary-10 focus:border-custom-primary-80`,
    disabled: `cursor-not-allowed !text-custom-primary-60 !border-custom-primary-60 `
  },
  "neutral-primary": {
    default: `text-custom-text-200 bg-custom-background-100 border border-custom-border-200`,
    hover: `hover:bg-custom-background-90`,
    pressed: `focus:text-custom-text-300 focus:bg-custom-background-90`,
    disabled: `cursor-not-allowed !text-custom-text-400`
  },
  "link-primary": {
    default: `text-custom-primary-100 bg-custom-background-100`,
    hover: `hover:text-custom-primary-200`,
    pressed: `focus:text-custom-primary-80 `,
    disabled: `cursor-not-allowed !text-custom-primary-60`
  },
  danger: {
    default: `text-white bg-red-500`,
    hover: ` hover:bg-red-600`,
    pressed: `focus:text-red-200 focus:bg-red-600`,
    disabled: `cursor-not-allowed !bg-red-300`
  },
  "accent-danger": {
    default: `text-red-500 bg-red-50`,
    hover: `hover:text-red-600 hover:bg-red-100`,
    pressed: `focus:text-red-500 focus:bg-red-100`,
    disabled: `cursor-not-allowed !text-red-300`
  },
  "outline-danger": {
    default: `text-red-500 bg-custom-background-100 border border-red-500`,
    hover: `hover:text-red-400 hover:border-red-400`,
    pressed: `focus:text-red-400 focus:border-red-400`,
    disabled: `cursor-not-allowed !text-red-300 !border-red-300`
  },
  "link-danger": {
    default: `text-red-500 bg-custom-background-100`,
    hover: `hover:text-red-400`,
    pressed: `focus:text-red-400`,
    disabled: `cursor-not-allowed !text-red-300`
  },
  "tertiary-danger": {
    default: `text-red-500 bg-custom-background-100 border border-red-200`,
    hover: `hover:bg-red-50 hover:border-red-300`,
    pressed: `focus:text-red-400`,
    disabled: `cursor-not-allowed !text-red-300`
  }
};
var getButtonStyling = (variant, size, disabled = false) => {
  let _variant = ``;
  const currentVariant = buttonStyling[variant];
  _variant = `${currentVariant.default} ${disabled ? currentVariant.disabled : currentVariant.hover} ${currentVariant.pressed}`;
  let _size = ``;
  if (size === "sm")
    _size = "px-3 py-1.5 font-medium text-xs rounded flex items-center gap-1.5 whitespace-nowrap transition-all justify-center inline" /* sm */;
  if (size === "md")
    _size = "px-4 py-1.5 font-medium text-sm rounded flex items-center gap-1.5 whitespace-nowrap transition-all justify-center inline" /* md */;
  if (size === "lg")
    _size = "px-5 py-2 font-medium text-base rounded flex items-center gap-1.5 whitespace-nowrap transition-all justify-center inline" /* lg */;
  return `${_variant} ${_size}`;
};
var getIconStyling = (size) => {
  let icon = ``;
  if (size === "sm")
    icon = "h-3 w-3 flex justify-center items-center overflow-hidden my-0.5 flex-shrink-0" /* sm */;
  if (size === "md")
    icon = "h-3.5 w-3.5 flex justify-center items-center overflow-hidden my-0.5 flex-shrink-0" /* md */;
  if (size === "lg")
    icon = "h-4 w-4 flex justify-center items-center overflow-hidden my-0.5 flex-shrink-0" /* lg */;
  return icon;
};

// src/buttons/button.tsx
var Button = React.forwardRef(
  (props, ref) => {
    const {
      variant = "primary",
      size = "sm",
      type = "button",
      loading = false,
      disabled = false,
      prependIcon = null,
      appendIcon = null,
      children,
      ...rest
    } = props;
    const buttonStyle = getButtonStyling(variant, size, disabled || loading);
    const buttonIconStyle = getIconStyling(size);
    return /* @__PURE__ */ React.createElement("button", {
      ref,
      type,
      className: `${buttonStyle}`,
      disabled: disabled || loading,
      ...rest
    }, prependIcon && /* @__PURE__ */ React.createElement("div", {
      className: buttonIconStyle
    }, React.cloneElement(prependIcon, { "stroke-width": 2 })), children, appendIcon && /* @__PURE__ */ React.createElement("div", {
      className: buttonIconStyle
    }, React.cloneElement(appendIcon, { "stroke-width": 2 })));
  }
);
Button.displayName = "plane-ui-button";

// src/form-fields/input.tsx
var React2 = __toESM(require("react"));
var Input = React2.forwardRef((props, ref) => {
  const {
    id,
    type,
    name,
    mode = "primary",
    inputSize = "sm",
    hasError = false,
    className = "",
    ...rest
  } = props;
  return /* @__PURE__ */ React2.createElement("input", {
    id,
    ref,
    type,
    name,
    className: `block rounded-md bg-transparent text-sm focus:outline-none placeholder-custom-text-400 ${mode === "primary" ? "rounded-md border border-custom-border-200" : mode === "transparent" ? "rounded border-none bg-transparent ring-0 transition-all focus:ring-1 focus:ring-custom-primary" : mode === "true-transparent" ? "rounded border-none bg-transparent ring-0" : ""} ${hasError ? "border-red-500" : ""} ${hasError && mode === "primary" ? "bg-red-500/20" : ""} ${inputSize === "sm" ? "px-3 py-2" : inputSize === "md" ? "p-3" : ""} ${className}`,
    ...rest
  });
});
Input.displayName = "form-input-field";

// src/form-fields/textarea.tsx
var React3 = __toESM(require("react"));
var useAutoSizeTextArea = (textAreaRef, value) => {
  React3.useEffect(() => {
    if (textAreaRef) {
      textAreaRef.style.height = "0px";
      const scrollHeight = textAreaRef.scrollHeight;
      textAreaRef.style.height = scrollHeight + "px";
    }
  }, [textAreaRef, value]);
};
var TextArea = React3.forwardRef(
  (props, ref) => {
    const {
      id,
      name,
      value = "",
      rows = 1,
      cols = 1,
      mode = "primary",
      hasError = false,
      className = "",
      ...rest
    } = props;
    const textAreaRef = React3.useRef(ref);
    ref && useAutoSizeTextArea(textAreaRef == null ? void 0 : textAreaRef.current, value);
    return /* @__PURE__ */ React3.createElement("textarea", {
      id,
      name,
      ref: textAreaRef,
      value,
      rows,
      cols,
      className: `no-scrollbar w-full bg-transparent placeholder-custom-text-400 px-3 py-2 outline-none ${mode === "primary" ? "rounded-md border border-custom-border-200" : mode === "transparent" ? "rounded border-none bg-transparent ring-0 transition-all focus:ring-1 focus:ring-theme" : ""} ${hasError ? "border-red-500" : ""} ${hasError && mode === "primary" ? "bg-red-100" : ""} ${className}`,
      ...rest
    });
  }
);

// src/progress/radial-progress.tsx
var import_react = __toESM(require("react"));
var RadialProgressBar = (props) => {
  const { progress } = props;
  const [circumference, setCircumference] = (0, import_react.useState)(0);
  (0, import_react.useEffect)(() => {
    const radius = 40;
    const circumference2 = 2 * Math.PI * radius;
    setCircumference(circumference2);
  }, []);
  const progressOffset = (100 - progress) / 100 * circumference;
  return /* @__PURE__ */ import_react.default.createElement("div", {
    className: "relative h-4 w-4"
  }, /* @__PURE__ */ import_react.default.createElement("svg", {
    className: "absolute top-0 left-0",
    viewBox: "0 0 100 100"
  }, /* @__PURE__ */ import_react.default.createElement("circle", {
    className: "stroke-current opacity-10",
    cx: "50",
    cy: "50",
    r: "40",
    strokeWidth: "12",
    fill: "none",
    strokeDasharray: `${circumference} ${circumference}`
  }), /* @__PURE__ */ import_react.default.createElement("circle", {
    className: `stroke-current`,
    cx: "50",
    cy: "50",
    r: "40",
    strokeWidth: "12",
    fill: "none",
    strokeDasharray: `${circumference} ${circumference}`,
    strokeDashoffset: progressOffset,
    transform: "rotate(-90 50 50)"
  })));
};

// src/spinners/circular-spinner.tsx
var React5 = __toESM(require("react"));
var Spinner = () => /* @__PURE__ */ React5.createElement("div", {
  role: "status"
}, /* @__PURE__ */ React5.createElement("svg", {
  "aria-hidden": "true",
  className: "mr-2 h-8 w-8 animate-spin fill-blue-600 text-custom-text-200",
  viewBox: "0 0 100 101",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg"
}, /* @__PURE__ */ React5.createElement("path", {
  d: "M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z",
  fill: "currentColor"
}), /* @__PURE__ */ React5.createElement("path", {
  d: "M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z",
  fill: "currentFill"
})), /* @__PURE__ */ React5.createElement("span", {
  className: "sr-only"
}, "Loading..."));
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Button,
  Input,
  RadialProgressBar,
  Spinner,
  TextArea
});

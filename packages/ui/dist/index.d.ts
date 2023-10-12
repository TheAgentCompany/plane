import * as React from 'react';
import React__default, { FC } from 'react';

declare type TButtonVariant = "primary" | "accent-primary" | "outline-primary" | "neutral-primary" | "link-primary" | "danger" | "accent-danger" | "outline-danger" | "link-danger" | "tertiary-danger";
declare type TButtonSizes = "sm" | "md" | "lg" | "xl";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: TButtonVariant;
    size?: TButtonSizes;
    className?: string;
    loading?: boolean;
    disabled?: boolean;
    appendIcon?: any;
    prependIcon?: any;
    children: React.ReactNode;
}
declare const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;

interface IToggleSwitchProps {
    value: boolean;
    onChange: (value: boolean) => void;
    label?: string;
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
    className?: string;
}
declare const ToggleSwitch: React.FC<IToggleSwitchProps>;

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    mode?: "primary" | "transparent" | "true-transparent";
    inputSize?: "sm" | "md";
    hasError?: boolean;
    className?: string;
}
declare const Input: React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>;

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    mode?: "primary" | "transparent";
    hasError?: boolean;
    className?: string;
}
declare const TextArea: React.ForwardRefExoticComponent<TextAreaProps & React.RefAttributes<HTMLTextAreaElement>>;

interface IRadialProgressBar {
    progress: number;
}
declare const RadialProgressBar: FC<IRadialProgressBar>;

declare type Props$2 = {
    maxValue?: number;
    value?: number;
    radius?: number;
    strokeWidth?: number;
    activeStrokeColor?: string;
    inactiveStrokeColor?: string;
};
declare const ProgressBar: React__default.FC<Props$2>;

declare type Props$1 = {
    data: any;
    noTooltip?: boolean;
};
declare const LinearProgressIndicator: React__default.FC<Props$1>;

declare const Spinner: React.FC;

declare type Props = {
    children: React__default.ReactNode;
    className?: string;
};
declare const Loader: {
    ({ children, className }: Props): JSX.Element;
    Item: React__default.FC<ItemProps>;
    displayName: string;
};
declare type ItemProps = {
    height?: string;
    width?: string;
};

declare type TPosition = "top" | "right" | "bottom" | "left" | "auto" | "auto-end" | "auto-start" | "bottom-left" | "bottom-right" | "left-bottom" | "left-top" | "right-bottom" | "right-top" | "top-left" | "top-right";
interface ITooltipProps {
    tooltipHeading?: string;
    tooltipContent: string | React__default.ReactNode;
    position?: TPosition;
    children: JSX.Element;
    disabled?: boolean;
    className?: string;
    openDelay?: number;
    closeDelay?: number;
}
declare const Tooltip: React__default.FC<ITooltipProps>;

export { Button, ButtonProps, Input, InputProps, LinearProgressIndicator, Loader, ProgressBar, RadialProgressBar, Spinner, TPosition, TextArea, TextAreaProps, ToggleSwitch, Tooltip };

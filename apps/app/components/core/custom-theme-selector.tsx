import React, { useEffect, useState } from "react";

import { useTheme } from "next-themes";

import { useForm } from "react-hook-form";

// hooks
import useUser from "hooks/use-user";
// ui
import { PrimaryButton } from "components/ui";
import { ColorPickerInput } from "components/core";
// services
import userService from "services/user.service";
// helper
import { applyTheme } from "helpers/theme.helper";
import { hexToRgb, rgbToHex } from "helpers/color.helper";
// types
import { ICustomTheme } from "types";

type Props = {
  preLoadedData?: Partial<ICustomTheme> | null;
};
const defaultValues = {
  "accent-500": "#FE5050",
  bgBase: "#FFF7F7",
  bgSurface1: "#FFE0E0",
  bgSurface2: "#FFF7F7",
  border: "#FFC9C9",
  darkPalette: false,
  palette: "",
  sidebar: "#FFFFFF",
  textBase: "#430000",
  textSecondary: "#323232",
};

export const CustomThemeSelector: React.FC<Props> = ({ preLoadedData }) => {
  const [darkPalette, setDarkPalette] = useState(false);

  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
    watch,
    setValue,
    reset,
  } = useForm<any>({
    defaultValues,
  });

  const { setTheme } = useTheme();
  const { mutateUser } = useUser();

  const calculateShade = (hexValue: string, shade: number): string => {
    const { r, g, b } = hexToRgb(hexValue);

    if (shade > 500) {
      let decimalValue = 0.1;

      if (shade === 600) decimalValue = 0.9;
      else if (shade === 700) decimalValue = 0.8;
      else if (shade === 800) decimalValue = 0.7;
      else if (shade === 900) decimalValue = 0.6;

      const newR = Math.ceil(r * decimalValue);
      const newG = Math.ceil(g * decimalValue);
      const newB = Math.ceil(b * decimalValue);

      return rgbToHex({ r: newR, g: newG, b: newB });
    } else {
      const decimalValue = 1 - (shade * 2) / 1000;

      const newR = Math.floor(r + (255 - r) * decimalValue);
      const newG = Math.floor(g + (255 - g) * decimalValue);
      const newB = Math.floor(b + (255 - b) * decimalValue);

      return rgbToHex({ r: newR, g: newG, b: newB });
    }
  };

  const handleFormSubmit = async (formData: any) => {
    const accent = {
      50: calculateShade(formData["accent-500"], 50),
      100: calculateShade(formData["accent-500"], 100),
      200: calculateShade(formData["accent-500"], 200),
      300: calculateShade(formData["accent-500"], 300),
      400: calculateShade(formData["accent-500"], 400),
      500: formData["accent-500"],
      600: calculateShade(formData["accent-500"], 600),
      700: calculateShade(formData["accent-500"], 700),
      800: calculateShade(formData["accent-500"], 800),
      900: calculateShade(formData["accent-500"], 900),
    };

    const payload: ICustomTheme = {
      accent,
      bgBase: formData.bgBase,
      bgSurface1: formData.bgSurface1,
      bgSurface2: formData.bgSurface2,
      border: formData.border,
      darkPalette: darkPalette,
      palette: `${formData.bgBase},${formData.bgSurface1},${formData.bgSurface2},${formData.border},${formData.sidebar},${accent[50]},${accent[100]},${accent[200]},${accent[300]},${accent[400]},${accent[500]},${accent[600]},${accent[700]},${accent[800]},${accent[900]},${formData.textBase},${formData.textSecondary}`,
      sidebar: formData.sidebar,
      textBase: formData.textBase,
      textSecondary: formData.textSecondary,
    };

    await userService
      .updateUser({
        theme: payload,
      })
      .then((res) => {
        mutateUser((prevData) => {
          if (!prevData) return prevData;

          return { ...prevData, ...res };
        }, false);

        applyTheme(payload.palette, darkPalette);
        setTheme("custom");
      })
      .catch((err) => console.log(err));
  };

  const handleUpdateTheme = async (formData: any) => {
    await handleFormSubmit({ ...formData, darkPalette });
  };

  useEffect(() => {
    reset({
      ...defaultValues,
      ...preLoadedData,
      "accent-500": preLoadedData?.accent?.[500] || "#FE5050",
    });
  }, [preLoadedData, reset]);

  return (
    <form onSubmit={handleSubmit(handleUpdateTheme)}>
      <div className="space-y-5">
        <h3 className="text-lg font-semibold text-brand-base">Customize your theme</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3">
            <div className="flex flex-col items-start gap-2">
              <h3 className="text-left text-sm font-medium text-brand-secondary">
                Primary background color
              </h3>
              <ColorPickerInput
                name="bgBase"
                error={errors.bgBase}
                watch={watch}
                setValue={setValue}
                register={register}
              />
            </div>

            <div className="flex flex-col items-start gap-2">
              <h3 className="text-left text-sm font-medium text-brand-secondary">
                Secondary background color
              </h3>
              <ColorPickerInput
                name="bgSurface1"
                error={errors.bgSurface1}
                watch={watch}
                setValue={setValue}
                register={register}
              />
            </div>

            <div className="flex flex-col items-start gap-2">
              <h3 className="text-left text-sm font-medium text-brand-secondary">
                Tertiary background color
              </h3>
              <ColorPickerInput
                name="bgSurface2"
                error={errors.bgSurface2}
                watch={watch}
                setValue={setValue}
                register={register}
              />
            </div>

            <div className="flex flex-col items-start gap-2">
              <h3 className="text-left text-sm font-medium text-brand-secondary">Border color</h3>
              <ColorPickerInput
                name="border"
                error={errors.border}
                watch={watch}
                setValue={setValue}
                register={register}
              />
            </div>

            <div className="flex flex-col items-start gap-2">
              <h3 className="text-left text-sm font-medium text-brand-secondary">
                Sidebar background color
              </h3>
              <ColorPickerInput
                name="sidebar"
                error={errors.sidebar}
                watch={watch}
                setValue={setValue}
                register={register}
              />
            </div>

            <div className="flex flex-col items-start gap-2">
              <h3 className="text-left text-sm font-medium text-brand-secondary">Accent color</h3>
              <ColorPickerInput
                name="accent-500"
                error={errors["accent-500"]}
                watch={watch}
                setValue={setValue}
                register={register}
              />
            </div>

            <div className="flex flex-col items-start gap-2">
              <h3 className="text-left text-sm font-medium text-brand-secondary">
                Primary text color
              </h3>
              <ColorPickerInput
                name="textBase"
                error={errors.textBase}
                watch={watch}
                setValue={setValue}
                register={register}
              />
            </div>

            <div className="flex flex-col items-start gap-2">
              <h3 className="text-left text-sm font-medium text-brand-secondary">
                Secondary text color
              </h3>
              <ColorPickerInput
                name="textSecondary"
                error={errors.textSecondary}
                watch={watch}
                setValue={setValue}
                register={register}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <PrimaryButton type="submit" loading={isSubmitting}>
          {isSubmitting ? "Creating Theme..." : "Set Theme"}
        </PrimaryButton>
      </div>
    </form>
  );
};

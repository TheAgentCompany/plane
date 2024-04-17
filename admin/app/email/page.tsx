"use client";

import useSWR from "swr";
import { observer } from "mobx-react-lite";
// hooks
import { useInstance } from "@/hooks";
// ui
import { Loader } from "@plane/ui";
// components
import { InstanceEmailForm } from "components/email";

const InstanceEmailPage = observer(() => {
  // store
  const { fetchInstanceConfigurations, formattedConfig } = useInstance();

  useSWR("INSTANCE_CONFIGURATIONS", () => fetchInstanceConfigurations());

  return (
    <div className="flex flex-col gap-8">
      <div className="mb-2 border-b border-custom-border-100 pb-3">
        <div className="pb-1 text-xl font-medium text-custom-text-100">Secure emails from your own instance</div>
        <div className="text-sm font-normal text-custom-text-300">
          Plane can send useful emails to you and your users from your own instance without talking to the Internet.
        </div>
        <div className="text-sm font-normal text-custom-text-300">
          Set it up below and please test your settings before you save them.{" "}
          <span className="text-red-400">Misconfigs can lead to email bounces and errors.</span>
        </div>
      </div>
      {formattedConfig ? (
        <InstanceEmailForm config={formattedConfig} />
      ) : (
        <Loader className="space-y-10">
          <Loader.Item height="50px" width="75%" />
          <Loader.Item height="50px" width="75%" />
          <Loader.Item height="50px" width="40%" />
          <Loader.Item height="50px" width="40%" />
          <Loader.Item height="50px" width="20%" />
        </Loader>
      )}
    </div>
  );
});

export default InstanceEmailPage;

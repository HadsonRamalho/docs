import { NextIntlClientProvider, useMessages } from "next-intl";
import { SettingsForm } from "@/components/interface/settings/settings-form";

export default function SettingsPage() {
  const messages = useMessages();

  return (
    <div className="container mx-auto max-w-6xl py-10 p-4 space-y-8">
      <NextIntlClientProvider messages={messages}>
        <SettingsForm />
      </NextIntlClientProvider>
    </div>
  );
}

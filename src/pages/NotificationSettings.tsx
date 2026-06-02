import { vaults } from "@/components/Notification/exampleNotification/example";
import { Text } from "@/components/Text";
import { useState } from "react";

type SettingsToggleProps = {
  checked?: boolean;
  label: string;
  onChange?: (checked: boolean) => void;
};

function SettingsToggle({ checked, label, onChange }: SettingsToggleProps) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        aria-label={label}
        onChange={(event) => onChange?.(event.target.checked)}
      />
      <span
        className="notification-settings-toggle peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--accent-transparent)]"
        aria-hidden="true"
      />
    </label>
  );
}

export default function NotificationSettings() {
  const [emailNotification, setEmailNotification] = useState(true);
  const [pushNotification, setPushNotification] = useState(false);
  const [frequency, setFrequency] = useState("");
  const [quietHours, setQuietHours] = useState("12:00");
  return (
    <>
      <div className="w-full rounded-md z-20 px-3 py-3 notification-settings-panel">
        <Text role="title" as="h2">Notification Settings</Text>
        <div>
          <div className="grid grid-cols-2 justify-center items-center mt-5">
            <Text role="body" as="p">Email Notification</Text>
            <div className="flex flex-col items-end justify-end gap-4">
              <SettingsToggle
                label="Email Notification"
                checked={emailNotification}
                onChange={setEmailNotification}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 justify-center items-center mt-5">
            <Text role="body" as="p">Push Notification</Text>
            <div className="flex flex-col items-end justify-end gap-4">
              <SettingsToggle
                label="Push Notification"
                checked={pushNotification}
                onChange={setPushNotification}
              />
            </div>
          </div>
          <div className="flex justify-between items-center mt-5">
            <label htmlFor="notification-frequency">
              <Text role="body" as="span">Notification Frequency</Text>
            </label>
            <select
              className="w-[200px] notification-settings-field"
              value={frequency}
              onChange={(e) => {
                setFrequency(e.target.value);
              }}
              name="notification-frequency"
              id="notification-frequency"
            >
              <option value="1">Occurance</option>
              <option value="2">Daily</option>
              <option value="3">Weekly</option>
              <option value="4">Never</option>
            </select>
          </div>
          <div className="flex justify-between items-center mt-5">
            <label htmlFor="quiet-hours">
              <Text role="body" as="span">Quiet Hours</Text>
            </label>
            <input
              className="w-[200px] notification-settings-field"
              type="time"
              id="quiet-hours"
              value={quietHours}
              onChange={(e) => {
                setQuietHours(e.target.value);
              }}
            />
          </div>
        </div>
      </div>

      <div className="w-full rounded-md z-20 px-3 py-3 mt-5 notification-settings-panel">
        <Text role="title" as="h2">Vault Notifications</Text>
        {vaults.map((v) => (
          <div className="grid grid-cols-2 justify-center items-center mt-5" key={v.name}>
            <Text role="body" as="p">{v.name}</Text>
            <div className="flex flex-col items-end justify-end gap-4">
              <SettingsToggle label={`${v.name} notifications`} />
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .notification-settings-panel {
          background: var(--surface);
          color: var(--text);
          border: 1px solid var(--border);
        }

        .notification-settings-field {
          background: var(--surface-raised);
          color: var(--text);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: var(--spacing-1) var(--spacing-2);
        }

        .notification-settings-field:focus {
          border-color: var(--accent);
          outline: 2px solid var(--accent-transparent);
          outline-offset: 2px;
        }

        .notification-settings-toggle {
          position: relative;
          width: 2rem;
          height: 0.75rem;
          border-radius: 9999px;
          background: var(--surface-raised);
          border: 1px solid var(--border);
          transition: background 150ms ease, border-color 150ms ease;
        }

        .notification-settings-toggle::after {
          content: "";
          position: absolute;
          top: -0.4rem;
          left: -0.25rem;
          width: 1.5rem;
          height: 1.5rem;
          border-radius: 9999px;
          background: var(--bg);
          border: 1px solid var(--border);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
          transition: transform 150ms ease, background 150ms ease, border-color 150ms ease;
        }

        .peer:checked + .notification-settings-toggle {
          background: var(--accent);
          border-color: var(--accent);
        }

        .peer:checked + .notification-settings-toggle::after {
          transform: translateX(1rem);
          background: var(--surface);
          border-color: var(--accent);
        }

        .peer:focus + .notification-settings-toggle {
          outline: 4px solid var(--accent-transparent);
          outline-offset: 4px;
        }
      `}</style>
    </>
  );
}

import { useState } from "react";
import toast from "react-hot-toast";
import { generateStrongPassword } from "../lib/password";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function PasswordField({ value, onChange }: Props) {
  const [visible, setVisible] = useState(false);

  const handleSuggest = () => {
    onChange(generateStrongPassword());
    toast.success("Strong password suggested", { duration: 2500 });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast.success("Password copied!", { duration: 2000 });
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Add a password"
          className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-xs font-semibold"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>

      <div className="flex gap-4 text-sm">
        <button type="button" onClick={handleSuggest} className="text-blue-600 hover:underline">
          Suggest a strong password
        </button>
        {value && (
          <button type="button" onClick={handleCopy} className="text-blue-600 hover:underline">
            Copy
          </button>
        )}
      </div>
    </div>
  );
}
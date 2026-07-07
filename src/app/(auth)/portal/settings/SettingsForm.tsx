'use client';

import { updateProfile, updatePassword } from '../../actions';

interface SettingsFormProps {
  displayName: string;
  email: string;
}

export function SettingsForm({ displayName, email }: SettingsFormProps) {
  return (
    <div className="space-y-8">
      {/* Profile form */}
      <form action={updateProfile} className="space-y-4">
        <div>
          <label
            htmlFor="displayName"
            className="mb-1 block font-label text-xs uppercase tracking-widest text-bmj-tan"
          >
            Display Name
          </label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            defaultValue={displayName}
            className="w-full border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream focus:border-bmj-red focus:outline-none"
          />
        </div>

        <div>
          <p className="mb-1 font-label text-xs uppercase tracking-widest text-bmj-tan">
            Email
          </p>
          <p className="font-body text-sm text-bmj-cream/70">{email}</p>
        </div>

        <button
          type="submit"
          className="bg-bmj-red px-6 py-2 font-label text-xs uppercase tracking-widest text-bmj-white transition-opacity hover:opacity-90"
        >
          Save Changes
        </button>
      </form>

      <div className="border-t border-bmj-tan/20" />

      {/* Password form */}
      <form action={updatePassword} className="space-y-4">
        <h3 className="font-display text-xl text-bmj-white">CHANGE PASSWORD</h3>
        <div>
          <label
            htmlFor="password"
            className="mb-1 block font-label text-xs uppercase tracking-widest text-bmj-tan"
          >
            New Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            className="w-full border border-bmj-tan/30 bg-bmj-black px-4 py-3 font-body text-sm text-bmj-cream focus:border-bmj-red focus:outline-none"
            placeholder="Enter a new password"
          />
        </div>

        <button
          type="submit"
          className="border border-bmj-tan/30 px-6 py-2 font-label text-xs uppercase tracking-widest text-bmj-cream transition-colors hover:border-bmj-red hover:text-bmj-white"
        >
          Update Password
        </button>
      </form>
    </div>
  );
}

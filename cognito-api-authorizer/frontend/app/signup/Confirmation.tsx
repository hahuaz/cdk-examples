"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";

import { useAppContext } from "@/context/AppContext";

function Confirmation() {
  const router = useRouter();

  const {
    state: { userPoolClientId, email },
    cognitoProvider,
  } = useAppContext();

  const [confirmationCode, setConfirmationCode] = useState("");

  const confirm = async () => {
    try {
      console.log(email);
      const response = await cognitoProvider.confirmSignUp({
        ClientId: userPoolClientId,
        Username: email,
        ConfirmationCode: confirmationCode,
      });
      if (response.$metadata.httpStatusCode === 200) {
        router.push("/login");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-sm mx-auto p-4 border rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Confirm Account</h2>
      <p className="mb-4">
        A verification code has been sent to your email. Use it to confirm your
        account.
      </p>
      <div className="mb-4">
        <input
          className="w-full px-3 py-2 border rounded"
          type="text"
          placeholder="Confirmation Code"
          value={confirmationCode}
          onChange={(e) => setConfirmationCode(e.target.value)}
        />
      </div>
      <button
        className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
        onClick={confirm}
      >
        Confirm
      </button>
    </div>
  );
}

export default Confirmation;

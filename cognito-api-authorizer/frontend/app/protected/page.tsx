"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAppContext } from "@/context/AppContext";

export default function Protected() {
  const router = useRouter();
  const {
    state: { authenticationResult, apiUrl },
  } = useAppContext();

  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiUrl}/protected`, {
          headers: {
            Authorization: `Bearer ${authenticationResult.IdToken}`,
          },
        });

        if (response.status === 200) {
          const responseData = await response.json();
          setData(responseData);
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [authenticationResult.IdToken]);

  return (
    <div>
      {data ? (
        <div>
          <h2>Data from Protected Endpoint:</h2>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}

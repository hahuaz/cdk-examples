import Link from "next/link";

import { useAppContext } from "@/context/AppContext";

export default function Navbar() {
  const {
    state: { authenticationResult, email },
    dispatch,
  } = useAppContext();

  const logout = () => {
    dispatch({ type: "SET_AUTHENTICATION_RESULT", payload: {} });
  };

  return (
    <nav className="bg-gray-800 p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex space-x-4 text-white">
          <Link href="/">Dashboard</Link>
          {authenticationResult.IdToken && (
            <>
              <span className="text-gray-300">|</span>
              <Link href="/protected">Protected</Link>
            </>
          )}
        </div>
        <div className="flex space-x-4 text-white">
          {!authenticationResult.IdToken ? (
            <>
              <Link href="/signup">Sign Up</Link>
              <span className="text-gray-300">|</span>
              <Link href="/login">Login</Link>
            </>
          ) : (
            <>
              <span className="text-white">{email}</span>
              <span className="text-gray-300">|</span>
              <button className="text-white" onClick={logout}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

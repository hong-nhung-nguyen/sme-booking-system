import { createContext } from "react";

/**
 * Lives in its own module so the provider file only exports components,
 * which keeps React Fast Refresh working during development.
 */
export const AuthContext = createContext(null);

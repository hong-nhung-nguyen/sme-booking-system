import { useContext } from "react";
import { AuthContext } from "../context/authContext";

export default function useAuth() {
    const context = useContext(AuthContext);

    if (context === null) {
        throw new Error("useAuth must be used inside an AuthProvider");
    }

    return context;
}

export function actorName(user) {
    if (!user) return "UNKNOWN";

    const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");

    return fullName || user.email || "UNKNOWN";
}

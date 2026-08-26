import { useContext } from "react";
import { ActiveLocationContext } from "../context/activeLocationContext";

export default function useActiveLocation() {
    const context = useContext(ActiveLocationContext);

    // !null === true
    if (!context) {
        throw new Error("useActiveLocation must be used inside ActiveLocationProvider ");
    }

    return context; 
}
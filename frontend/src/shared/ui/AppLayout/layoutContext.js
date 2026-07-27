import { createContext, useContext, useEffect } from "react";

/**
 * Lets a page replace the sidebar that AppLayout renders by default.
 * The schedule uses it to swap NavSider for its bookings list, which keeps
 * that toggle's state on the page that owns the data.
 */
export const LayoutContext = createContext(null);

export function useSidebarSlot(node) {
    const context = useContext(LayoutContext);
    const setSidebar = context?.setSidebar;

    useEffect(() => {
        if (!setSidebar) return;

        setSidebar(node);

        // Hand the sidebar back to AppLayout when the page unmounts
        return () => setSidebar(null);
    }, [setSidebar, node]);
}

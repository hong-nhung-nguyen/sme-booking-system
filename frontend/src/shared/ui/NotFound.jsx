import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <div className="page-loader">
            <span>
                That page does not exist. <Link to="/bookings">Back to bookings</Link>
            </span>
        </div>
    );
}

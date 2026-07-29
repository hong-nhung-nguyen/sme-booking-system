import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <div className="page-loader">
            <span>
                That page does not exist. <Link to="/schedule-calendar">Back to schedule</Link>
            </span>
        </div>
    );
}

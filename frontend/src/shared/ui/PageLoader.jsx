import Spinner from "./Spinner";

// Full-height placeholder used while a route waits for its first response
export default function PageLoader({ label = "Loading" }) {
    return (
        <div className="page-loader" role="status">
            <Spinner />
            <span>{label}...</span>
        </div>
    );
}

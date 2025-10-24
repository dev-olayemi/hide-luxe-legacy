import React from "react";
import { Link } from "react-router-dom";

const Admin404: React.FC = () => (
  <div className="max-w-3xl mx-auto text-center py-32">
    <h1 className="text-6xl font-extrabold mb-4">404</h1>
    <h2 className="text-2xl font-semibold mb-6">Admin page not found</h2>
    <p className="text-muted-foreground mb-8">
      The admin page you requested does not exist. Use the navigation to get
      back to the dashboard.
    </p>
    <div className="flex justify-center gap-4">
      <Link to="/admin/dashboard" className="btn btn-primary">
        Go to Dashboard
      </Link>
      <Link to="/" className="btn btn-outline">
        View Site
      </Link>
    </div>
  </div>
);

export default Admin404;

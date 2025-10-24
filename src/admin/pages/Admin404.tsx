import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const Admin404 = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="relative">
          <h1 className="text-9xl font-bold text-white/10">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl font-bold text-white">404</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Admin Page Not Found</h2>
          <p className="text-gray-300">
            The admin page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="default" size="lg">
            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Admin Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="bg-white/10 text-white hover:bg-white/20">
            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Admin404;

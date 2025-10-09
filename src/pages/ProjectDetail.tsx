/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseUtils";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchProject = async () => {
      const ref = doc(db, "projects", id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setProject({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    };
    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-gray-400">Loading project...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-red-500">Project not found.</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">
            {project.name || "Untitled Project"}
          </h1>
          {project.image && (
            <img
              src={project.image}
              alt={project.name}
              className="w-full max-h-96 object-cover rounded-lg mb-6"
            />
          )}
          <div className="mb-4">
            <span className="font-semibold">Category:</span>{" "}
            <span className="text-indigo-700">{project.category || "N/A"}</span>
          </div>
          <div className="mb-4">
            <span className="font-semibold">Description:</span>
            <p className="mt-1 text-gray-700">
              {project.description || "No description provided."}
            </p>
          </div>
          {project.createdAt && (
            <div className="mb-4 text-sm text-gray-500">
              Created:{" "}
              {project.createdAt.toDate
                ? project.createdAt.toDate().toLocaleString()
                : new Date(project.createdAt).toLocaleString()}
            </div>
          )}
          {/* Add more project fields as needed */}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProjectDetail;

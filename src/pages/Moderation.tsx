import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Post } from "@/components/Post";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getReportedPosts, getPostReports, handleReportedPost } from "@/lib/api/moderation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  ShieldCheck, 
  ShieldX, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle 
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Post as PostType } from "@/types/post";
import type { ReportWithUser } from "@/types/database/moderation.types";

interface ReportedPost {
  post_id: string;
  count: number;
  posts: {
    id: string;
    content: string;
    user_id: string;
    media_url: string | null;
    media_type: string | null;
    created_at: string;
    profiles: {
      username: string | null;
      avatar_url: string | null;
    }
  }
}

const ModerationPage = () => {
  const [reportedPosts, setReportedPosts] = useState<ReportedPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [postReports, setPostReports] = useState<ReportWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModerator, setIsModerator] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const checkModeratorStatus = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      navigate("/auth");
      return false;
    }
    
    return true;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const isAllowed = await checkModeratorStatus();
        setIsModerator(isAllowed);
        
        if (isAllowed) {
          const posts = await getReportedPosts();
          setReportedPosts(posts);
          
          if (posts.length > 0) {
            setSelectedPost(posts[0].post_id);
            const reports = await getPostReports(posts[0].post_id);
            setPostReports(reports);
          }
        }
      } catch (error) {
        console.error("Error loading moderation data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los datos de moderación",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [navigate, toast]);

  const handleSelectPost = async (postId: string) => {
    try {
      setSelectedPost(postId);
      setLoading(true);
      const reports = await getPostReports(postId);
      setPostReports(reports);
    } catch (error) {
      console.error("Error loading post reports:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los reportes de esta publicación",
      });
    } finally {
      setLoading(false);
    }
  };

  const getReasonLabel = (reason: string) => {
    switch(reason) {
      case 'spam': return 'Spam o contenido engañoso';
      case 'violence': return 'Violencia o contenido peligroso';
      case 'nudity': return 'Desnudos o contenido sexual';
      case 'hate_speech': return 'Discurso de odio o acoso';
      default: return 'Otro motivo';
    }
  };

  const handleAction = async (action: 'approve' | 'reject' | 'delete') => {
    if (!selectedPost) return;
    
    try {
      setLoading(true);
      await handleReportedPost(selectedPost, action);
      
      const posts = await getReportedPosts();
      setReportedPosts(posts);
      
      if (posts.length > 0 && !posts.some(p => p.post_id === selectedPost)) {
        setSelectedPost(posts[0].post_id);
        const reports = await getPostReports(posts[0].post_id);
        setPostReports(reports);
      } else if (posts.length === 0) {
        setSelectedPost(null);
        setPostReports([]);
      }
      
      toast({
        title: "Acción completada",
        description: action === 'approve' 
          ? "Publicación aprobada y restaurada" 
          : action === 'reject'
            ? "Publicación rechazada y mantenida oculta"
            : "Publicación eliminada permanentemente",
      });
    } catch (error) {
      console.error(`Error ${action}ing post:`, error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `No se pudo ${
          action === 'approve' ? 'aprobar' : action === 'reject' ? 'rechazar' : 'eliminar'
        } la publicación`,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isModerator) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-6 max-w-md">
          <h1 className="text-2xl font-bold mb-4">Acceso restringido</h1>
          <p className="mb-4">No tienes permisos para acceder a esta página.</p>
          <Button onClick={() => navigate("/")}>Volver al inicio</Button>
        </Card>
      </div>
    );
  }

  const selectedPostData = selectedPost
    ? reportedPosts.find(p => p.post_id === selectedPost)?.posts as unknown as PostType
    : null;

  return (
    <div className="min-h-screen flex bg-background">
      <Navigation />
      <div className="flex-1 flex justify-center md:ml-[70px]">
        <main className="w-full max-w-6xl px-4 py-6 md:py-8 pb-20 md:pb-8">
          <div className="sticky top-0 bg-background z-10 pb-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <h1 className="text-2xl font-semibold">Moderación</h1>
              </div>
            </div>
          </div>

          {loading ? (
            <Card className="p-4">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-20 bg-muted rounded" />
              </div>
            </Card>
          ) : reportedPosts.length === 0 ? (
            <Card className="p-8 text-center">
              <ShieldCheck className="h-16 w-16 mx-auto mb-4 text-green-500" />
              <h2 className="text-xl font-semibold mb-2">No hay publicaciones reportadas</h2>
              <p className="text-muted-foreground">
                Todas las publicaciones reportadas han sido revisadas.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-3">
                <Card className="p-4">
                  <h2 className="text-lg font-medium mb-4">Publicaciones reportadas</h2>
                  <div className="space-y-2">
                    {reportedPosts.map((post) => (
                      <div 
                        key={post.post_id}
                        className={`p-3 rounded-md cursor-pointer flex justify-between ${
                          selectedPost === post.post_id 
                            ? 'bg-accent' 
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => handleSelectPost(post.post_id)}
                      >
                        <div className="truncate">
                          {post.posts.profiles.username || 'Usuario'}
                        </div>
                        <div className="text-sm font-semibold text-destructive">
                          {post.count} reportes
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <div className="md:col-span-9">
                {selectedPostData && (
                  <Tabs defaultValue="post">
                    <TabsList className="mb-4">
                      <TabsTrigger value="post">Publicación</TabsTrigger>
                      <TabsTrigger value="reports">Reportes ({postReports.length})</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="post" className="space-y-4">
                      <div className="flex gap-2 justify-end">
                        <Button 
                          variant="outline" 
                          onClick={() => handleAction('approve')}
                          className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Aprobar
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => handleAction('reject')}
                          className="text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Rechazar
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => handleAction('delete')}
                          className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </Button>
                      </div>
                      
                      <Post post={selectedPostData} hideComments={true} />
                    </TabsContent>
                    
                    <TabsContent value="reports">
                      <Card className="p-4">
                        <h3 className="text-lg font-medium mb-4">Detalles de los reportes</h3>
                        <div className="space-y-4">
                          {postReports.map((report) => (
                            <div key={report.id} className="border rounded-md p-4">
                              <div className="flex items-center gap-3 mb-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={report.user.avatar_url || undefined} />
                                  <AvatarFallback>{report.user.username?.[0] || 'U'}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{report.user.username || 'Usuario'}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {new Date(report.created_at).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                                <span className="font-medium">{getReasonLabel(report.reason)}</span>
                              </div>
                              
                              {report.description && (
                                <p className="text-sm text-muted-foreground border-t pt-2 mt-2">
                                  {report.description}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </Card>
                    </TabsContent>
                  </Tabs>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ModerationPage;


import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Save, 
  User, 
  Bell, 
  Lock, 
  Volume2,
  FileAudio,
  HelpCircle
} from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Profile settings
  const [username, setUsername] = useState("audiophile");
  const [email, setEmail] = useState("user@example.com");
  const [bio, setBio] = useState("Audio enthusiast and creator");
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [newCommentNotifications, setNewCommentNotifications] = useState(true);
  const [newFollowerNotifications, setNewFollowerNotifications] = useState(true);
  
  // Audio settings
  const [autoplay, setAutoplay] = useState(false);
  const [highQualityStreaming, setHighQualityStreaming] = useState(true);
  
  const handleSaveProfile = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen pb-16 md:pb-0 md:pl-16">
      <Navbar />
      
      <div className="container max-w-4xl mx-auto p-4">
        <header className="py-6">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </header>
        
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-3 md:w-fit">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="audio" className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              <span className="hidden sm:inline">Audio</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Account Security</h2>
              
              <div className="space-y-4">
                <Button variant="outline" className="gap-2">
                  <Lock className="h-4 w-4" />
                  Change Password
                </Button>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Two-factor authentication</p>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
            </Card>
            
            <div className="flex justify-end">
              <Button
                onClick={handleSaveProfile}
                disabled={isLoading}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Notification Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive email updates about your account
                    </p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">New Comments</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified when someone comments on your audio
                    </p>
                  </div>
                  <Switch
                    checked={newCommentNotifications}
                    onCheckedChange={setNewCommentNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">New Followers</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified when someone follows you
                    </p>
                  </div>
                  <Switch
                    checked={newFollowerNotifications}
                    onCheckedChange={setNewFollowerNotifications}
                  />
                </div>
              </div>
            </Card>
            
            <div className="flex justify-end">
              <Button className="gap-2">
                <Save className="h-4 w-4" />
                Save Preferences
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="audio" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Playback Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Autoplay</p>
                    <p className="text-sm text-muted-foreground">
                      Automatically play audio when loaded
                    </p>
                  </div>
                  <Switch
                    checked={autoplay}
                    onCheckedChange={setAutoplay}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">High Quality Streaming</p>
                    <p className="text-sm text-muted-foreground">
                      Stream at the highest quality (uses more data)
                    </p>
                  </div>
                  <Switch
                    checked={highQualityStreaming}
                    onCheckedChange={setHighQualityStreaming}
                  />
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Recording Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Default Audio Format</p>
                    <p className="text-sm text-muted-foreground">
                      Choose the default format for audio recordings
                    </p>
                  </div>
                  <select className="border rounded p-1">
                    <option>MP3</option>
                    <option>WAV</option>
                    <option>AAC</option>
                  </select>
                </div>
                
                <Button variant="outline" className="gap-2">
                  <FileAudio className="h-4 w-4" />
                  Manage Storage
                </Button>
              </div>
            </Card>
            
            <div className="flex justify-end">
              <Button className="gap-2">
                <Save className="h-4 w-4" />
                Save Settings
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-8 border-t pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <HelpCircle className="h-4 w-4" />
              <span>Need help? Contact support</span>
            </div>
            <Button variant="outline">Delete Account</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

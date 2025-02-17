
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const Messages = () => {
  const contacts = [
    { id: 1, name: "Carlos Ruiz", avatar: "/placeholder.svg", lastMessage: "¿Cómo va todo?", time: "12:30" },
    { id: 2, name: "María López", avatar: "/placeholder.svg", lastMessage: "¡Genial!", time: "11:45" },
    { id: 3, name: "Juan García", avatar: "/placeholder.svg", lastMessage: "Nos vemos mañana", time: "10:20" },
  ];

  const messages = [
    { id: 1, text: "¡Hola! ¿Cómo estás?", sent: false, time: "12:25" },
    { id: 2, text: "¡Hey! Todo bien, ¿y tú?", sent: true, time: "12:26" },
    { id: 3, text: "Muy bien, gracias. ¿Tienes planes para el fin de semana?", sent: false, time: "12:28" },
    { id: 4, text: "Aún no, ¿tienes alguna idea?", sent: true, time: "12:30" },
  ];

  return (
    <div className="min-h-screen flex bg-muted/30">
      <Navigation />
      <main className="flex-1 max-w-6xl mx-auto p-4 md:p-6 pb-20 md:pb-6">
        <Card className="grid md:grid-cols-[320px,1fr] h-[calc(100vh-120px)]">
          {/* Contacts List */}
          <div className="border-r">
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar mensajes" className="pl-9" />
              </div>
            </div>
            <ScrollArea className="h-[calc(100%-73px)]">
              {contacts.map((contact) => (
                <button
                  key={contact.id}
                  className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors border-b"
                >
                  <Avatar>
                    <AvatarImage src={contact.avatar} />
                    <AvatarFallback>{contact.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{contact.name}</div>
                    <div className="text-sm text-muted-foreground truncate">
                      {contact.lastMessage}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">{contact.time}</div>
                </button>
              ))}
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center gap-3">
              <Avatar>
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>CR</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">Carlos Ruiz</div>
                <div className="text-sm text-muted-foreground">En línea</div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sent ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.sent
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p>{message.text}</p>
                      <div
                        className={`text-xs mt-1 ${
                          message.sent ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}
                      >
                        {message.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input placeholder="Escribe un mensaje..." className="flex-1" />
                <Button size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Messages;

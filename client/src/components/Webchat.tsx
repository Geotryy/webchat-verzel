import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Loader2, Calendar, MessageCircle, X, Minimize2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Message {
  id: number;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date;
}

interface TimeSlot {
  start: Date;
  end: Date;
  formatted: string;
}

export default function Webchat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [showSlots, setShowSlots] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const startConversation = trpc.chat.startConversation.useMutation();
  const sendMessage = trpc.chat.sendMessage.useMutation();
  const getSlots = trpc.chat.getAvailableSlots.useQuery(
    { sessionId },
    { enabled: false }
  );
  const scheduleMeeting = trpc.chat.scheduleMeeting.useMutation();

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      startConversation.mutate(
        { sessionId },
        {
          onSuccess: (data) => {
            if (data.welcomeMessage) {
              setMessages([
                {
                  id: Date.now(),
                  role: "assistant",
                  content: data.welcomeMessage,
                  createdAt: new Date(),
                },
              ]);
            }
          },
        }
      );
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || sendMessage.isPending) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: inputValue,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    sendMessage.mutate(
      { sessionId, message: inputValue },
      {
        onSuccess: (data) => {
          const assistantMessage: Message = {
            id: Date.now() + 1,
            role: "assistant",
            content: data.response,
            createdAt: new Date(),
          };
          setMessages((prev) => [...prev, assistantMessage]);

          // Se interesse foi confirmado, mostrar opção de agendamento
          if (data.leadInfo?.interestConfirmed) {
            setTimeout(() => {
              setShowSlots(true);
            }, 1000);
          }
        },
        onError: (error) => {
          const errorMessage: Message = {
            id: Date.now() + 1,
            role: "assistant",
            content: "Desculpe, ocorreu um erro. Por favor, tente novamente.",
            createdAt: new Date(),
          };
          setMessages((prev) => [...prev, errorMessage]);
        },
      }
    );
  };

  const handleShowSlots = async () => {
    const result = await getSlots.refetch();
    if (result.data?.slots) {
      setAvailableSlots(
        result.data.slots.map((slot) => ({
          ...slot,
          start: new Date(slot.start),
          end: new Date(slot.end),
        }))
      );
    }
  };

  const handleScheduleSlot = (slot: TimeSlot) => {
    scheduleMeeting.mutate(
      {
        sessionId,
        slotStart: slot.start.toISOString(),
        slotEnd: slot.end.toISOString(),
      },
      {
        onSuccess: (data) => {
          const confirmMessage: Message = {
            id: Date.now(),
            role: "assistant",
            content: `Perfeito! Sua reunião foi agendada com sucesso. Você receberá um e-mail com o link da reunião: ${data.meetingLink}`,
            createdAt: new Date(),
          };
          setMessages((prev) => [...prev, confirmMessage]);
          setAvailableSlots([]);
          setShowSlots(false);
        },
        onError: () => {
          const errorMessage: Message = {
            id: Date.now(),
            role: "assistant",
            content: "Desculpe, não consegui agendar a reunião. Por favor, tente novamente.",
            createdAt: new Date(),
          };
          setMessages((prev) => [...prev, errorMessage]);
        },
      }
    );
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 flex items-center justify-center group"
        aria-label="Abrir chat"
      >
        <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
      </button>
    );
  }

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ${
        isMinimized
          ? "bottom-6 right-6 w-80 h-16"
          : "bottom-6 right-6 w-full max-w-md h-[600px] sm:h-[700px]"
      }`}
    >
      <Card className="w-full h-full flex flex-col shadow-2xl overflow-hidden rounded-3xl border-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Assistente Verzel</h3>
              <p className="text-xs text-white/80">Online agora</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-white/20 rounded-full"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} fade-in`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-md"
                        : "bg-white text-gray-800 shadow-sm border border-gray-100"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    <span
                      className={`text-xs mt-1 block ${
                        message.role === "user" ? "text-white/70" : "text-gray-400"
                      }`}
                    >
                      {format(message.createdAt, "HH:mm")}
                    </span>
                  </div>
                </div>
              ))}

              {sendMessage.isPending && (
                <div className="flex justify-start fade-in">
                  <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span className="text-sm text-gray-600">Digitando...</span>
                    </div>
                  </div>
                </div>
              )}

              {showSlots && availableSlots.length === 0 && (
                <div className="flex justify-center fade-in">
                  <Button
                    onClick={handleShowSlots}
                    disabled={getSlots.isFetching}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full px-6 py-3 shadow-lg"
                  >
                    {getSlots.isFetching ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Buscando horários...
                      </>
                    ) : (
                      <>
                        <Calendar className="w-4 h-4 mr-2" />
                        Ver horários disponíveis
                      </>
                    )}
                  </Button>
                </div>
              )}

              {availableSlots.length > 0 && (
                <div className="space-y-2 fade-in">
                  <p className="text-sm text-gray-600 text-center mb-3">
                    Escolha um horário para nossa reunião:
                  </p>
                  {availableSlots.map((slot, index) => (
                    <Button
                      key={index}
                      onClick={() => handleScheduleSlot(slot)}
                      disabled={scheduleMeeting.isPending}
                      variant="outline"
                      className="w-full justify-start hover:bg-blue-50 hover:border-blue-300 transition-colors rounded-xl py-6"
                    >
                      <Calendar className="w-4 h-4 mr-3 text-blue-600" />
                      <span className="text-sm font-medium">{slot.formatted}</span>
                    </Button>
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-100">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  disabled={sendMessage.isPending}
                  className="flex-1 rounded-full border-gray-200 focus:border-blue-400 focus:ring-blue-400 px-5 py-6"
                />
                <Button
                  type="submit"
                  disabled={!inputValue.trim() || sendMessage.isPending}
                  className="rounded-full w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg disabled:opacity-50"
                >
                  {sendMessage.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </form>
              <p className="text-xs text-gray-400 text-center mt-2">
                Powered by Verzel AI
              </p>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}


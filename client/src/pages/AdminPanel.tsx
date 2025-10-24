import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Calendar, Mail, Building2, Phone, Clock, MessageSquare, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "wouter";

export default function AdminPanel() {
  const { user, loading: authLoading } = useAuth();
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  
  const { data: leadsData, isLoading, refetch } = trpc.leads.list.useQuery();
  const { data: leadDetail } = trpc.leads.getById.useQuery(
    { id: selectedLeadId! },
    { enabled: !!selectedLeadId }
  );
  const updateStatus = trpc.leads.updateStatus.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>
              Você não tem permissão para acessar esta página.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full">Voltar para Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const leads = leadsData?.leads || [];
  
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      new: { label: "Novo", variant: "default" },
      contacted: { label: "Contatado", variant: "secondary" },
      qualified: { label: "Qualificado", variant: "outline" },
      meeting_scheduled: { label: "Reunião Agendada", variant: "default" },
      closed: { label: "Fechado", variant: "destructive" },
    };
    
    const config = variants[status] || { label: status, variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredLeads = (status?: string) => {
    if (!status) return leads;
    return leads.filter((lead) => lead.status === status);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
              <p className="text-gray-600 mt-1">Gerencie leads e conversas do webchat</p>
            </div>
            <Link href="/">
              <Button variant="outline">Voltar para Home</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total de Leads</CardDescription>
              <CardTitle className="text-3xl">{leads.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Novos</CardDescription>
              <CardTitle className="text-3xl text-blue-600">
                {filteredLeads("new").length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Qualificados</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {filteredLeads("qualified").length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Reuniões Agendadas</CardDescription>
              <CardTitle className="text-3xl text-purple-600">
                {filteredLeads("meeting_scheduled").length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Leads Table */}
        <Card>
          <CardHeader>
            <CardTitle>Leads</CardTitle>
            <CardDescription>
              Visualize e gerencie todos os leads capturados pelo webchat
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="all">Todos ({leads.length})</TabsTrigger>
                <TabsTrigger value="new">Novos ({filteredLeads("new").length})</TabsTrigger>
                <TabsTrigger value="qualified">Qualificados ({filteredLeads("qualified").length})</TabsTrigger>
                <TabsTrigger value="meeting_scheduled">
                  Com Reunião ({filteredLeads("meeting_scheduled").length})
                </TabsTrigger>
              </TabsList>

              {["all", "new", "qualified", "meeting_scheduled"].map((tab) => (
                <TabsContent key={tab} value={tab}>
                  <div className="space-y-4">
                    {(tab === "all" ? leads : filteredLeads(tab)).map((lead) => (
                      <Card
                        key={lead.id}
                        className="hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setSelectedLeadId(lead.id)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="space-y-3 flex-1">
                              <div className="flex items-center gap-3">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {lead.name}
                                </h3>
                                {getStatusBadge(lead.status)}
                                {lead.interestConfirmed && (
                                  <Badge variant="outline" className="bg-green-50 text-green-700">
                                    Interesse Confirmado
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4" />
                                  {lead.email}
                                </div>
                                {lead.company && (
                                  <div className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4" />
                                    {lead.company}
                                  </div>
                                )}
                                {lead.phone && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    {lead.phone}
                                  </div>
                                )}
                                {lead.meetingDateTime && (
                                  <div className="flex items-center gap-2 text-purple-600 font-medium">
                                    <Calendar className="w-4 h-4" />
                                    {format(new Date(lead.meetingDateTime), "dd/MM/yyyy 'às' HH:mm", {
                                      locale: ptBR,
                                    })}
                                  </div>
                                )}
                              </div>

                              {lead.need && (
                                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                                  <strong>Necessidade:</strong> {lead.need}
                                </p>
                              )}
                            </div>

                            <div className="ml-4">
                              <Select
                                value={lead.status}
                                onValueChange={(value) => {
                                  updateStatus.mutate({
                                    id: lead.id,
                                    status: value as any,
                                  });
                                }}
                              >
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="new">Novo</SelectItem>
                                  <SelectItem value="contacted">Contatado</SelectItem>
                                  <SelectItem value="qualified">Qualificado</SelectItem>
                                  <SelectItem value="meeting_scheduled">Reunião Agendada</SelectItem>
                                  <SelectItem value="closed">Fechado</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Criado em {format(new Date(lead.createdAt), "dd/MM/yyyy 'às' HH:mm")}
                            </div>
                            {lead.meetingLink && (
                              <a
                                href={lead.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-blue-600 hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink className="w-3 h-3" />
                                Link da reunião
                              </a>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {(tab === "all" ? leads : filteredLeads(tab)).length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Nenhum lead encontrado nesta categoria</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Lead Detail Dialog */}
      <Dialog open={!!selectedLeadId} onOpenChange={() => setSelectedLeadId(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Lead</DialogTitle>
            <DialogDescription>
              Visualize o histórico completo da conversa
            </DialogDescription>
          </DialogHeader>

          {leadDetail && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Nome</p>
                  <p className="font-medium">{leadDetail.lead.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">E-mail</p>
                  <p className="font-medium">{leadDetail.lead.email}</p>
                </div>
                {leadDetail.lead.company && (
                  <div>
                    <p className="text-sm text-gray-600">Empresa</p>
                    <p className="font-medium">{leadDetail.lead.company}</p>
                  </div>
                )}
                {leadDetail.lead.phone && (
                  <div>
                    <p className="text-sm text-gray-600">Telefone</p>
                    <p className="font-medium">{leadDetail.lead.phone}</p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-3">Histórico da Conversa</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {leadDetail.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          message.role === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <span
                          className={`text-xs mt-1 block ${
                            message.role === "user" ? "text-blue-100" : "text-gray-500"
                          }`}
                        >
                          {format(new Date(message.createdAt), "HH:mm")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


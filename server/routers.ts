import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { generateChatResponse, extractLeadInfo } from "./services/openai";
import { getAvailableSlots, scheduleEvent, setGoogleTokens, getAuthUrl, exchangeCodeForTokens } from "./services/googleCalendar";
import { createPipefyCard, updatePipefyCard } from "./services/pipefy";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  chat: router({
    // Iniciar nova conversa
    startConversation: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .mutation(async ({ input }) => {
        const existing = await db.getConversationBySessionId(input.sessionId);
        if (existing) {
          return { conversationId: existing.id, isNew: false };
        }

        await db.createConversation({ sessionId: input.sessionId });
        const conversation = await db.getConversationBySessionId(input.sessionId);
        
        if (!conversation) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Falha ao criar conversa" });
        }

        // Mensagem inicial do assistente
        const welcomeMessage = "Olá! Bem-vindo à Verzel. Sou seu assistente virtual e estou aqui para entender como podemos ajudá-lo. Para começar, qual é o seu nome?";
        
        await db.createMessage({
          conversationId: conversation.id,
          role: "assistant",
          content: welcomeMessage,
        });

        return { conversationId: conversation.id, isNew: true, welcomeMessage };
      }),

    // Enviar mensagem
    sendMessage: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        message: z.string(),
      }))
      .mutation(async ({ input }) => {
        const conversation = await db.getConversationBySessionId(input.sessionId);
        if (!conversation) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Conversa não encontrada" });
        }

        // Salvar mensagem do usuário
        await db.createMessage({
          conversationId: conversation.id,
          role: "user",
          content: input.message,
        });

        // Buscar histórico
        const history = await db.getMessagesByConversationId(conversation.id);
        const messages = history.map(m => ({
          role: m.role as "system" | "user" | "assistant",
          content: m.content,
        }));

        // Gerar resposta do assistente
        const assistantResponse = await generateChatResponse(messages);

        // Salvar resposta do assistente
        await db.createMessage({
          conversationId: conversation.id,
          role: "assistant",
          content: assistantResponse,
        });

        // Extrair informações do lead
        const leadInfo = await extractLeadInfo(messages);
        
        // Atualizar conversa com informações do lead
        if (Object.keys(leadInfo).length > 0) {
          await db.updateConversation(conversation.id, {
            leadName: leadInfo.name || conversation.leadName,
            leadEmail: leadInfo.email || conversation.leadEmail,
            leadCompany: leadInfo.company || conversation.leadCompany,
            leadPhone: leadInfo.phone || conversation.leadPhone,
            leadNeed: leadInfo.need || conversation.leadNeed,
            leadTimeline: leadInfo.timeline || conversation.leadTimeline,
            interestConfirmed: leadInfo.interestConfirmed || conversation.interestConfirmed,
          });

          // Se interesse foi confirmado e temos email, criar/atualizar no Pipefy
          if (leadInfo.interestConfirmed && leadInfo.email) {
            try {
              if (!conversation.pipefyCardId) {
                const cardId = await createPipefyCard({
                  name: leadInfo.name || "Lead sem nome",
                  email: leadInfo.email,
                  company: leadInfo.company,
                  phone: leadInfo.phone,
                  need: leadInfo.need,
                  timeline: leadInfo.timeline,
                  interestConfirmed: true,
                });
                
                await db.updateConversation(conversation.id, { pipefyCardId: cardId });
              } else {
                await updatePipefyCard(conversation.pipefyCardId, leadInfo);
              }
            } catch (error) {
              console.error("Error syncing with Pipefy:", error);
            }
          }
        }

        return { response: assistantResponse, leadInfo };
      }),

    // Buscar histórico de mensagens
    getHistory: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(async ({ input }) => {
        const conversation = await db.getConversationBySessionId(input.sessionId);
        if (!conversation) {
          return { messages: [] };
        }

        const messages = await db.getMessagesByConversationId(conversation.id);
        return { messages };
      }),

    // Obter horários disponíveis
    getAvailableSlots: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(async ({ input }) => {
        const conversation = await db.getConversationBySessionId(input.sessionId);
        if (!conversation || !conversation.interestConfirmed) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Interesse não confirmado" });
        }

        try {
          const slots = await getAvailableSlots(7);
          return { slots };
        } catch (error) {
          console.error("Error getting slots:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Falha ao buscar horários" });
        }
      }),

    // Agendar reunião
    scheduleMeeting: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        slotStart: z.string(),
        slotEnd: z.string(),
      }))
      .mutation(async ({ input }) => {
        const conversation = await db.getConversationBySessionId(input.sessionId);
        if (!conversation || !conversation.leadEmail || !conversation.leadName) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Informações do lead incompletas" });
        }

        try {
          const startTime = new Date(input.slotStart);
          const endTime = new Date(input.slotEnd);

          const meetingLink = await scheduleEvent(
            conversation.leadName,
            conversation.leadEmail,
            startTime,
            endTime,
            conversation.leadNeed || undefined
          );

          // Atualizar conversa
          await db.updateConversation(conversation.id, {
            meetingScheduled: true,
            meetingLink,
            meetingDateTime: startTime,
            status: "scheduled",
          });

          // Criar lead no banco
          await db.createLead({
            conversationId: conversation.id,
            name: conversation.leadName,
            email: conversation.leadEmail,
            company: conversation.leadCompany || undefined,
            phone: conversation.leadPhone || undefined,
            need: conversation.leadNeed || undefined,
            timeline: conversation.leadTimeline || undefined,
            interestConfirmed: true,
            meetingScheduled: true,
            meetingLink,
            meetingDateTime: startTime,
            pipefyCardId: conversation.pipefyCardId || undefined,
            status: "meeting_scheduled",
          });

          // Atualizar Pipefy
          if (conversation.pipefyCardId) {
            await updatePipefyCard(conversation.pipefyCardId, {
              meetingLink,
              meetingDateTime: startTime,
            });
          }

          return { success: true, meetingLink };
        } catch (error) {
          console.error("Error scheduling meeting:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Falha ao agendar reunião" });
        }
      }),
  }),

  leads: router({
    // Listar todos os leads (admin)
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }

      const leads = await db.getAllLeads();
      return { leads };
    }),

    // Obter detalhes de um lead (admin)
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
        }

        const lead = await db.getLeadById(input.id);
        if (!lead) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Lead não encontrado" });
        }

        // Buscar histórico da conversa
        const messages = await db.getMessagesByConversationId(lead.conversationId);

        return { lead, messages };
      }),

    // Atualizar status do lead (admin)
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["new", "contacted", "qualified", "meeting_scheduled", "closed"]),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
        }

        await db.updateLead(input.id, { status: input.status });
        return { success: true };
      }),
  }),

  admin: router({
    // Obter URL de autenticação do Google Calendar
    getGoogleAuthUrl: protectedProcedure.query(({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }

      return { url: getAuthUrl() };
    }),

    // Trocar código por tokens
    exchangeGoogleCode: protectedProcedure
      .input(z.object({ code: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
        }

        const tokens = await exchangeCodeForTokens(input.code);
        return { success: true, tokens };
      }),
  }),
});

export type AppRouter = typeof appRouter;


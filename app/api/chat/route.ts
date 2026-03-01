import {
  streamText,
  tool,
  convertToModelMessages,
  type UIMessage,
  stepCountIs,
} from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getWalletBalance } from "@/lib/actions/wallet";
import { getDashboardStats } from "@/lib/actions/dashboard";
import { getAnalyticsData } from "@/lib/actions/analytics";
import { getUserSession } from "@/lib";
import { getTransactionByReference } from "@/lib/actions/transactions";
import { USD_TO_UGX_EXCHANGE_RATE } from "@/constants";

export const maxDuration = 30;

export const POST = async (req: Request) => {
  const user = await getUserSession();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = user.id;
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: google("gemini-3-flash-preview"),
    system: systemPrompt(user.name),
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(10),
    tools: {
      getWalletBalance: tool({
        description: `Get the current wallet balance for the logged-in user. Returns the total available balance, if user asks in USD, convert to USD using the current exchange rate which is 1 USD = ${USD_TO_UGX_EXCHANGE_RATE} UGX`,
        inputSchema: z.object({}),
        execute: async () => {
          try {
            const result = await getWalletBalance(userId);
            return {
              balance: result?.balance ?? 0,
              currency: "UGX",
            };
          } catch (error) {
            console.error("Error getting wallet balance:", error);
            return {
              error: "Failed to get wallet balance, please try again later",
            };
          }
        },
      }),

      getDashboardStats: tool({
        description:
          "Get dashboard statistics including total balance, monthly income, monthly spending, and active cards count with trend comparisons to the previous month.",
        inputSchema: z.object({}),
        execute: async () => {
          try {
            const stats = await getDashboardStats(userId);
            return stats;
          } catch (error) {
            console.error("Error getting dashboard stats:", error);
            return {
              error: "Failed to get dashboard stats, please try again later",
            };
          }
        },
      }),

      getRecentTransactions: tool({
        description:
          "Get the most recent transactions for the logged-in user. Returns transactions where the user is either the sender or recipient, including amount, type, status, date, and display name.",
        inputSchema: z.object({
          limit: z
            .number()
            .min(1)
            .max(20)
            .default(10)
            .describe("Number of transactions to retrieve (1-20)"),
          type: z
            .enum(["ALL", "TRANSFER", "DEPOSIT", "WITHDRAWAL", "PAYMENT"])
            .default("ALL")
            .describe("Filter by transaction type"),
        }),
        execute: async ({ limit = 5, type }) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const where: any = {
            OR: [{ userId: userId }, { recipientId: userId }],
            status: "COMPLETED",
          };
          if (type && type !== "ALL") {
            where.type = type;
          }
          try {
            const transactions = await prisma.transaction.findMany({
              where,
              orderBy: { createdAt: "desc" },
              take: limit,
              include: {
                sender: { select: { name: true } },
                recipient: { select: { name: true } },
              },
            });

            return transactions.map((tx) => ({
              id: tx.id,
              amount: tx.amount.toNumber(),
              fee: tx.fee.toNumber(),
              currency: tx.currency,
              type: tx.type,
              status: tx.status,
              category: tx.category,
              method: tx.method,
              reference: tx.txn_ref,
              displayName: tx.displayName,
              senderName: tx.sender?.name,
              recipientName: tx.recipient?.name,
              direction: tx.userId === userId ? "OUTGOING" : "INCOMING",
              date: tx.createdAt.toISOString(),
              reason: tx.reason,
            }));
          } catch (error) {
            console.error("Error getting recent transactions:", error);
            return {
              error:
                "Failed to get recent transactions, please try again later",
            };
          }
        },
      }),

      getAnalytics: tool({
        description:
          "Get analytics data for the logged-in user over the last 30 days. Returns daily cash flow (income vs spending), expense categories, income categories, total income, and total spent.",
        inputSchema: z.object({}),
        execute: async () => {
          try {
            const data = await getAnalyticsData(userId);
            return {
              totalIncome: data.totalIncome,
              totalSpent: data.totalSpent,
              netFlow: data.totalIncome - data.totalSpent,
              topExpenseCategories: data.categories.slice(0, 5),
              topIncomeCategories: data.incomeCategories.slice(0, 5),
              currency: "UGX",
              period: "Last 30 days",
            };
          } catch (error) {
            console.error("Error getting analytics:", error);
            return {
              error: "Failed to get analytics, please try again later",
            };
          }
        },
      }),

      getUserProfile: tool({
        description:
          "Get basic profile information for the currently logged-in user, including name, email, and account privilege level.",
        inputSchema: z.object({}),
        execute: async () => {
          try {
            const user = await prisma.user.findUnique({
              where: { id: userId },
              select: {
                id: true,
                name: true,
                email: true,
                tel: true,
                privilege: true,
                status: true,
                created_at: true,
              },
            });
            return {
              name: user?.name,
              email: user?.email,
              phone: user?.tel,
              privilege: user?.privilege,
              accountActive: user?.status,
              memberSince: user?.created_at?.toISOString(),
            };
          } catch (error) {
            console.error("Error getting user profile:", error);
            return {
              error: "Failed to get user profile, please try again later",
            };
          }
        },
      }),

      getTransactionByRef: tool({
        description:
          "Get details of a specific transaction using its reference (txn_ref).",
        inputSchema: z.object({
          ref: z.string().describe("The transaction reference (e.g., TX_...)"),
        }),
        execute: async ({ ref }) => {
          try {
            const result = await getTransactionByReference(ref);
            if (!result || "error" in result) {
              return {
                error:
                  (result as { error: string })?.error ||
                  "Transaction not found.",
              };
            }
            return result;
          } catch (error) {
            console.error("Error in getTransactionByRef tool:", error);
            return { error: "Failed to fetch transaction details." };
          }
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
};

function systemPrompt(name: string) {
  return `You are PayNow AI, an intelligent analytics assistant embedded in the PayNow Gateway dashboard.
You help the user "${name}" understand their financial data.

Instructions:
1. Answer questions based strictly on the data retrieved from the tools.
2. Be concise, professional, and data-driven.
3. If the answer requires calculation (e.g., total revenue), perform it.
4. Format key numbers clearly with currency (UGX).
5. Use Markdown formatting:
   - Use **bold** for key figures and important terms.
   - Use bullet lists for summarizing multiple items.
   - Use tables for comparing data if applicable.
6. If you don't have enough data to answer, say so honestly.
7. Always call the appropriate tool(s) before answering — never guess or make up data.`;
}

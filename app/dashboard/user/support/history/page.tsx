import { getUserSession } from "@/lib/actions/session";
import { getSupportHistory } from "@/lib/actions/support";
import SupportHistoryView from "@/components/user/SupportHistoryView";
import { redirect } from "next/navigation";
import { Heart } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const SupportHistoryPage = async ({ searchParams }: PageProps) => {
  const user = await getUserSession();
  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = 10;

  const initialData = (await getSupportHistory({
    userId: user.id,
    page,
    pageSize,
  })) as SupportHistoryResponse;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-indigo-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
            <Heart size={28} />
          </div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              Support History
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              A record of your generosity and received support
            </p>
          </div>
        </div>
      </div>

      <SupportHistoryView initialData={initialData} />
    </div>
  );
};

export default SupportHistoryPage;
